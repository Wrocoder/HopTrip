from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.affiliate import AffiliateProgram, AffiliateProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination


def approved_program(db):
    provider = AffiliateProvider(
        code="travelpayouts",
        name="Fixture provider",
        onboarding_status="APPROVED",
        is_active=True,
        capabilities_json=["AFFILIATE_LINK"],
    )
    db.add(provider)
    db.flush()
    program = AffiliateProgram(
        provider_id=provider.id,
        code="flight-program",
        name="Fixture program",
        onboarding_status="APPROVED",
        is_active=True,
        capabilities_json=["AFFILIATE_LINK"],
        allowed_hosts=["partner.example"],
        tracking_param="sub_id",
    )
    db.add(program)
    db.flush()
    return program


def catalog_fixture(db, *, slug="fixture-deal", program=None, price="200.25", days=30):
    airport = Airport(iata_code="WRO", name="Wrocław", city="Wrocław", country_code="PL")
    destination = Destination(
        iata_code="BCN", city="Barcelona", country="Spain", country_code="ES", slug="barcelona"
    )
    db.add_all([airport, destination])
    db.flush()
    now = datetime.now(UTC)
    deal = Deal(
        slug=slug,
        origin_airport_id=airport.id,
        destination_id=destination.id,
        trip_start=(now + timedelta(days=days)).date(),
        trip_end=(now + timedelta(days=days + 3)).date(),
        depart_at=now + timedelta(days=days),
        nights=3,
        travelers=1,
        flight_price_pln=Decimal(price),
        total_estimated_pln=Decimal(price),
        price_per_person_pln=Decimal(price),
        deal_score=75,
        confidence=Decimal("0.5"),
        last_verified_at=now,
        expires_at=now + timedelta(hours=2),
    )
    db.add(deal)
    db.flush()
    component = DealComponent(
        deal_id=deal.id,
        component_type="FLIGHT",
        price_pln=Decimal(price),
        affiliate_program_id=program.id if program else None,
        metadata_json={"outbound_url": "https://partner.example/book?foo=bar&sub_id=old"},
    )
    db.add(component)
    db.commit()
    return deal, component
