"""Add consumer-facing flight deals and components."""

import sqlalchemy as sa
from alembic import op

revision = "0005_deals"
down_revision = "0004_route_statistics"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "deals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("origin_airport_id", sa.Integer(), sa.ForeignKey("airports.id"), nullable=False),
        sa.Column("destination_id", sa.Integer(), sa.ForeignKey("destinations.id"), nullable=False),
        sa.Column("trip_start", sa.Date(), nullable=False),
        sa.Column("trip_end", sa.Date(), nullable=False),
        sa.Column("nights", sa.Integer()),
        sa.Column("travelers", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("flight_price_pln", sa.Numeric(12, 2)),
        sa.Column("hotel_price_pln", sa.Numeric(12, 2)),
        sa.Column("other_costs_pln", sa.Numeric(12, 2)),
        sa.Column("total_estimated_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("price_per_person_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("historical_baseline_pln", sa.Numeric(12, 2)),
        sa.Column("discount_percent", sa.Numeric(6, 2)),
        sa.Column("deal_score", sa.Integer(), nullable=False),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="ACTIVE"),
        sa.Column("explanation", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("slug", name="uq_deals_slug"),
    )
    op.create_index("ix_deals_slug", "deals", ["slug"])
    op.create_index("ix_deals_origin_airport_id", "deals", ["origin_airport_id"])
    op.create_index("ix_deals_destination_id", "deals", ["destination_id"])
    op.create_index("ix_deals_trip_start", "deals", ["trip_start"])
    op.create_index(
        "ix_deals_discovery",
        "deals",
        ["origin_airport_id", "trip_start", "is_visible", "deal_score"],
    )
    op.create_index("ix_deals_freshness", "deals", ["expires_at", "is_visible"])

    op.create_table(
        "deal_components",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "deal_id", sa.Integer(), sa.ForeignKey("deals.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("travel_offer_id", sa.Integer(), sa.ForeignKey("travel_offers.id")),
        sa.Column("component_type", sa.String(32), nullable=False),
        sa.Column("price_pln", sa.Numeric(12, 2)),
        sa.Column("is_mandatory", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("label", sa.String(160)),
        sa.Column("metadata_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
    )
    op.create_index("ix_deal_components_deal_id", "deal_components", ["deal_id"])
    op.create_index("ix_deal_components_travel_offer_id", "deal_components", ["travel_offer_id"])
    op.create_index("ix_deal_components_deal", "deal_components", ["deal_id", "component_type"])


def downgrade() -> None:
    op.drop_table("deal_components")
    op.drop_table("deals")
