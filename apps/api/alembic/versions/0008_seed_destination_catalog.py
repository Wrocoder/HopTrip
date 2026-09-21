"""Seed a small destination catalog for route resolution and SEO pages."""

import sqlalchemy as sa
from alembic import op

revision = "0008_seed_destination_catalog"
down_revision = "0007_affiliate_clicks"
branch_labels = None
depends_on = None


def upgrade() -> None:
    destinations = sa.table(
        "destinations",
        sa.column("city", sa.String(120)),
        sa.column("country", sa.String(120)),
        sa.column("country_code", sa.String(2)),
        sa.column("iata_code", sa.String(3)),
        sa.column("slug", sa.String(160)),
        sa.column("destination_type", sa.String(40)),
        sa.column("is_active", sa.Boolean()),
    )
    op.bulk_insert(
        destinations,
        [
            {
                "city": "Barcelona",
                "country": "Spain",
                "country_code": "ES",
                "iata_code": "BCN",
                "slug": "barcelona",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Rome",
                "country": "Italy",
                "country_code": "IT",
                "iata_code": "FCO",
                "slug": "rome",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Lisbon",
                "country": "Portugal",
                "country_code": "PT",
                "iata_code": "LIS",
                "slug": "lisbon",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Malaga",
                "country": "Spain",
                "country_code": "ES",
                "iata_code": "AGP",
                "slug": "malaga",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Alicante",
                "country": "Spain",
                "country_code": "ES",
                "iata_code": "ALC",
                "slug": "alicante",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Athens",
                "country": "Greece",
                "country_code": "GR",
                "iata_code": "ATH",
                "slug": "athens",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Milan",
                "country": "Italy",
                "country_code": "IT",
                "iata_code": "MXP",
                "slug": "milan",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Paris",
                "country": "France",
                "country_code": "FR",
                "iata_code": "CDG",
                "slug": "paris",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "London",
                "country": "United Kingdom",
                "country_code": "GB",
                "iata_code": "LON",
                "slug": "london",
                "destination_type": "CITY",
                "is_active": True,
            },
            {
                "city": "Brussels",
                "country": "Belgium",
                "country_code": "BE",
                "iata_code": "BRU",
                "slug": "brussels",
                "destination_type": "CITY",
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM destinations WHERE slug IN "
            "('barcelona', 'rome', 'lisbon', 'malaga', 'alicante', 'athens', 'milan', 'paris', 'london', 'brussels')"
        )
    )
