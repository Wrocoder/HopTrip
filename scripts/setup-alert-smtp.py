"""Run on the VM with the existing monitor EnvironmentFile; never print secrets."""

import argparse
import os
import re
import secrets
import smtplib
import ssl
import sys
from datetime import UTC, datetime
from pathlib import Path


def quote(value):
    if any(ord(char) < 32 for char in value):
        raise ValueError("Control characters are not allowed")
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--configure", action="store_true")
    args = parser.parse_args()
    user = os.environ.get("IMAP_USER", "")
    password = os.environ.get("IMAP_PASSWORD", "")
    if user != "kontakt@hoptrip.pl" or not password:
        raise ValueError("Expected existing kontakt mailbox configuration")
    with smtplib.SMTP_SSL("smtp.mail.ovh.net", 465, timeout=20,
                          context=ssl.create_default_context()) as smtp:
        smtp.login(user, password)
        print("SMTP TLS and authentication: OK; no email sent")
    if not args.configure:
        return
    target = Path("/opt/hoptrip/.env.production")
    original = target.read_text()
    values = {
        "SMTP_HOST": "smtp.mail.ovh.net", "SMTP_PORT": "465", "SMTP_SECURITY": "ssl",
        "SMTP_USER": user, "SMTP_PASSWORD": password, "SMTP_SENDER": user,
        "ALERTS_SITE_URL": "https://hoptrip.pl", "ALERTS_ENABLED": "false",
        "ALERTS_DAILY_SIGNUP_LIMIT": "200",
    }
    # Do not rotate an existing signing key and invalidate management links.
    match = re.search(r"^ALERTS_SIGNING_KEY=(.*)$", original, re.MULTILINE)
    if match is None or not match.group(1).strip().strip("\"'"):
        values["ALERTS_SIGNING_KEY"] = secrets.token_hex(32)
    output = [line for line in original.splitlines() if line.partition("=")[0] not in values]
    output.extend(f"{key}={quote(value)}" for key, value in values.items())
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    backup = target.with_name(f".env.production.before-smtp-{stamp}")
    with backup.open("x") as handle:
        os.chmod(backup, 0o600)
        handle.write(original)
    temporary = target.with_name(".env.production.smtp-next")
    with temporary.open("x") as handle:
        os.chmod(temporary, 0o600)
        handle.write("\n".join(output) + "\n")
    os.replace(temporary, target)
    print("SMTP settings saved; registration remains disabled; no services restarted")


if __name__ == "__main__":
    os.umask(0o077)
    try:
        main()
    except Exception as error:
        # SMTP provider errors and environment values may contain credentials.
        print(f"SMTP setup failed ({type(error).__name__}); secret details suppressed", file=sys.stderr)
        sys.exit(1)
