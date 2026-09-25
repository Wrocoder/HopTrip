"""Interactive secret entry on the VM. Never put tokens in shell arguments."""

import argparse
import getpass
import imaplib
import json
import os
import re
import secrets
import ssl
import sys
import urllib.request
from pathlib import Path

ENV = Path("/etc/hoptrip/monitor.env")


def telegram(token, method):
    with urllib.request.urlopen(
        urllib.request.Request(
            "https://api.telegram.org/bot" + token + "/" + method,
            data=b"{}",
            headers={"Content-Type": "application/json"},
        ),
        timeout=20,
    ) as response:
        data = json.loads(response.read(2_000_000))
        if not data.get("ok"):
            raise RuntimeError
        return data["result"]


def quote(value):
    if any(ord(c) < 32 for c in value):
        raise ValueError("Control characters are not accepted")
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def store(values):
    ENV.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    lines = ENV.read_text().splitlines() if ENV.exists() else []
    lines = [line for line in lines if line.split("=", 1)[0] not in values]
    lines += [key + "=" + quote(value) for key, value in values.items()]
    temp = ENV.with_suffix(".tmp")
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as stream:
        stream.write("\n".join(lines) + "\n")
    temp.chmod(0o600)
    temp.replace(ENV)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mail", action="store_true", help="Configure Zimbra inbox only")
    args = parser.parse_args()
    if not hasattr(os, "geteuid") or os.geteuid() != 0 or not sys.stdin.isatty():
        print("Run with sudo in an interactive SSH terminal on the Oracle VM.")
        return 1
    try:
        if args.mail:
            user = input("Zimbra email [kontakt@hoptrip.pl]: ").strip() or "kontakt@hoptrip.pl"
            password = getpass.getpass("Zimbra mailbox password (hidden): ")
            with imaplib.IMAP4_SSL(
                "imap.mail.ovh.net", port=993, ssl_context=ssl.create_default_context(), timeout=20
            ) as client:
                client.login(user, password)
                if client.select("INBOX", readonly=True)[0] != "OK":
                    raise RuntimeError
            store({"IMAP_HOST": "imap.mail.ovh.net", "IMAP_USER": user, "IMAP_PASSWORD": password})
            print(
                "Mailbox login verified. Saved privately. Existing mail will be baselined on first run."
            )
        else:
            token = getpass.getpass("Telegram bot token (hidden): ").strip()
            if not re.fullmatch(r"[0-9]+:[A-Za-z0-9_-]+", token):
                raise ValueError
            bot = telegram(token, "getMe")
            if telegram(token, "getWebhookInfo").get("url"):
                print(
                    "This bot has an existing webhook. Use a separate notification bot; nothing changed."
                )
                return 1
            code = "hoptrip-" + secrets.token_hex(8)
            print(f"Open @{bot['username']} in your PRIVATE Telegram chat. Press Start.")
            print("Send exactly this pairing code to that bot: " + code)
            input("After sending, press Enter here: ")
            updates = telegram(token, "getUpdates")
            chats = {
                str(u["message"]["chat"]["id"])
                for u in updates
                if u.get("message", {}).get("text") == code
                and u["message"]["chat"].get("type") == "private"
            }
            if len(chats) != 1:
                print(
                    "Pairing message not found. Run setup again and send the new code. Nothing saved."
                )
                return 1
            store({"TELEGRAM_BOT_TOKEN": token, "TELEGRAM_CHAT_ID": chats.pop()})
            print(
                "Bot and private recipient verified. Saved to /etc/hoptrip/monitor.env (root, 600)."
            )
    except (Exception, KeyboardInterrupt):
        print("Setup failed or cancelled. Check credentials/network; secrets are not displayed.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
