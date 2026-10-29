"""Owner password hashing; session tokens are stored only as SHA-256 digests."""
import hashlib
import hmac
import secrets


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600000)
    return f"pbkdf2_sha256:600000:{salt}:{key.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        return hmac.compare_digest(password_hash(password, encoded.split(":")[2]), encoded)
    except (ValueError, IndexError):
        return False
