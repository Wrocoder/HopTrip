"""Create foundation catalog and affiliate tables."""
import sqlalchemy as sa
from alembic import op

revision = "0001_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "airports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("iata_code", sa.String(3), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        sa.Column("timezone", sa.String(64)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("iata_code", name="uq_airports_iata_code"),
    )
    op.create_index("ix_airports_iata_code", "airports", ["iata_code"])
    op.create_index("ix_airports_city", "airports", ["city"])
    op.create_index("ix_airports_country_code", "airports", ["country_code"])

    op.create_table(
        "destinations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("country", sa.String(120), nullable=False),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("slug", sa.String(160), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        sa.Column("timezone", sa.String(64)),
        sa.Column("destination_type", sa.String(40), nullable=False, server_default="CITY"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("slug", name="uq_destinations_slug"),
    )
    op.create_index("ix_destinations_city", "destinations", ["city"])
    op.create_index("ix_destinations_slug", "destinations", ["slug"])
    op.create_index("ix_destinations_country_code", "destinations", ["country_code"])

    op.create_table(
        "affiliate_providers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("onboarding_status", sa.String(32), nullable=False, server_default="NOT_CONFIGURED"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("website_url", sa.String(500)),
        sa.Column("configuration_ref", sa.String(200)),
        sa.Column("notes", sa.Text()),
        sa.Column("last_health_check", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("code", name="uq_affiliate_providers_code"),
    )
    op.create_index("ix_affiliate_providers_code", "affiliate_providers", ["code"])

    op.create_table(
        "affiliate_programs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("affiliate_providers.id"), nullable=False),
        sa.Column("code", sa.String(80), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("onboarding_status", sa.String(32), nullable=False, server_default="NOT_CONFIGURED"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("notes", sa.Text()),
        sa.Column("applied_at", sa.DateTime(timezone=True)),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("provider_id", "code", name="uq_program_provider_code"),
    )
    op.create_index("ix_affiliate_programs_provider_id", "affiliate_programs", ["provider_id"])

    airports = sa.table(
        "airports",
        sa.column("iata_code", sa.String),
        sa.column("name", sa.String),
        sa.column("city", sa.String),
        sa.column("country_code", sa.String),
        sa.column("timezone", sa.String),
    )
    op.bulk_insert(
        airports,
        [
            {"iata_code": "WRO", "name": "Wroclaw Airport", "city": "Wroclaw", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "WAW", "name": "Warsaw Chopin Airport", "city": "Warsaw", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "WMI", "name": "Warsaw Modlin Airport", "city": "Warsaw", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "KRK", "name": "John Paul II Krakow Airport", "city": "Krakow", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "KTW", "name": "Katowice Airport", "city": "Katowice", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "GDN", "name": "Gdansk Lech Walesa Airport", "city": "Gdansk", "country_code": "PL", "timezone": "Europe/Warsaw"},
            {"iata_code": "POZ", "name": "Poznan-Lawica Airport", "city": "Poznan", "country_code": "PL", "timezone": "Europe/Warsaw"},
        ],
    )

    providers = sa.table(
        "affiliate_providers",
        sa.column("code", sa.String),
        sa.column("name", sa.String),
        sa.column("website_url", sa.String),
        sa.column("notes", sa.Text),
    )
    op.bulk_insert(
        providers,
        [
            {"code": "trip_com", "name": "Trip.com", "website_url": "https://www.trip.com/", "notes": "Affiliate onboarding pending; link capabilities must follow provider terms."},
            {"code": "travelpayouts", "name": "Travelpayouts", "website_url": "https://www.travelpayouts.com/", "notes": "Network/program status is tracked separately; no credentials in source."},
            {"code": "discovercars", "name": "DiscoverCars", "website_url": "https://www.discovercars.com/", "notes": "Car rental affiliate candidate; onboarding pending."},
        ],
    )


def downgrade() -> None:
    op.drop_table("affiliate_programs")
    op.drop_table("affiliate_providers")
    op.drop_table("destinations")
    op.drop_table("airports")
