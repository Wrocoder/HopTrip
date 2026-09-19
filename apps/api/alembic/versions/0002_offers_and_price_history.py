"""Add normalized travel offers and durable price observations."""
import sqlalchemy as sa
from alembic import op

revision = "0002_offers_and_price_history"
down_revision = "0001_foundation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "data_providers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("configuration_ref", sa.String(200)),
        sa.Column("notes", sa.Text()),
        sa.Column("last_health_check", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("code", name="uq_data_providers_code"),
    )
    op.create_index("ix_data_providers_code", "data_providers", ["code"])
    data_providers = sa.table(
        "data_providers",
        sa.column("code", sa.String),
        sa.column("name", sa.String),
        sa.column("notes", sa.Text),
    )
    op.bulk_insert(
        data_providers,
        [
            {"code": "travelpayouts_data", "name": "Travelpayouts Data API", "notes": "Cached flight data; token required."},
            {"code": "amadeus", "name": "Amadeus Self-Service", "notes": "Technical data candidate; credentials and coverage must be verified."},
        ],
    )
    op.create_table(
        "travel_offers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("data_provider_id", sa.Integer(), sa.ForeignKey("data_providers.id"), nullable=False),
        sa.Column("external_id", sa.String(240), nullable=False),
        sa.Column("product_type", sa.String(32), nullable=False, server_default="FLIGHT"),
        sa.Column("origin_airport_id", sa.Integer(), sa.ForeignKey("airports.id")),
        sa.Column("destination_id", sa.Integer(), sa.ForeignKey("destinations.id")),
        sa.Column("depart_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("return_at", sa.DateTime(timezone=True)),
        sa.Column("original_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("original_currency", sa.String(3), nullable=False),
        sa.Column("price_pln", sa.Numeric(12, 2)),
        sa.Column("exchange_rate", sa.Numeric(16, 8)),
        sa.Column("exchange_rate_at", sa.DateTime(timezone=True)),
        sa.Column("source", sa.String(80), nullable=False),
        sa.Column("raw_payload", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_travel_offers_data_provider_id", "travel_offers", ["data_provider_id"])
    op.create_index("ix_travel_offers_external_id", "travel_offers", ["external_id"])
    op.create_index("ix_travel_offers_origin_airport_id", "travel_offers", ["origin_airport_id"])
    op.create_index("ix_travel_offers_destination_id", "travel_offers", ["destination_id"])
    op.create_index("ix_travel_offers_depart_at", "travel_offers", ["depart_at"])
    op.create_index("ix_travel_offers_expires_at", "travel_offers", ["expires_at"])
    op.create_index("ix_travel_offers_search", "travel_offers", ["origin_airport_id", "destination_id", "depart_at"])
    op.create_index("ix_travel_offers_freshness", "travel_offers", ["expires_at", "last_verified_at"])

    op.create_table(
        "price_observations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("data_provider_id", sa.Integer(), sa.ForeignKey("data_providers.id"), nullable=False),
        sa.Column("origin_airport_id", sa.Integer(), sa.ForeignKey("airports.id")),
        sa.Column("destination_id", sa.Integer(), sa.ForeignKey("destinations.id")),
        sa.Column("product_type", sa.String(32), nullable=False, server_default="FLIGHT"),
        sa.Column("departure_date", sa.Date(), nullable=False),
        sa.Column("trip_duration_days", sa.Integer()),
        sa.Column("observed_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("original_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("original_currency", sa.String(3), nullable=False),
        sa.Column("source", sa.String(80), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_price_observations_data_provider_id", "price_observations", ["data_provider_id"])
    op.create_index("ix_price_observations_origin_airport_id", "price_observations", ["origin_airport_id"])
    op.create_index("ix_price_observations_destination_id", "price_observations", ["destination_id"])
    op.create_index("ix_price_observations_departure_date", "price_observations", ["departure_date"])
    op.create_index("ix_price_observations_observed_at", "price_observations", ["observed_at"])
    op.create_index("ix_price_observations_route_date", "price_observations", ["origin_airport_id", "destination_id", "departure_date"])


def downgrade() -> None:
    op.drop_table("price_observations")
    op.drop_table("travel_offers")
    op.drop_table("data_providers")
