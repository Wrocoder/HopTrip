"""Generate EDITOR_PASSWORD_HASH without putting the password in shell history."""
from getpass import getpass

from app.services.editor_auth import password_hash


def main():
    password = getpass("New editor password (at least 16 characters): ")
    if len(password) < 16 or password != getpass("Repeat password: "):
        raise SystemExit("Passwords must match and contain at least 16 characters")
    print("EDITOR_PASSWORD_HASH=" + password_hash(password))


if __name__ == "__main__":
    main()
