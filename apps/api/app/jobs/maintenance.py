"""Token-free scheduled lifecycle and retention job."""

from app.db.session import SessionLocal
from app.services.deals import expire_deals
from app.services.retention import apply_retention

if __name__ == "__main__":
    with SessionLocal() as db:
        expired = expire_deals(db)
        apply_retention(db)
        print(f"maintenance expired_deals={expired}")
