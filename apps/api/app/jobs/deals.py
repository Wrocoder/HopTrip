from app.db.session import SessionLocal
from app.services.deals import generate_fresh_deals


def run_deal_generation() -> int:
    with SessionLocal() as db:
        return generate_fresh_deals(db)

