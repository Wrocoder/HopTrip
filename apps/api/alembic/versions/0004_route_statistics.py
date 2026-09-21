"""Add explainable route price statistics."""

import sqlalchemy as sa
from alembic import op

revision = "0004_route_statistics"
down_revision = "0003_destination_iata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "route_statistics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "data_provider_id", sa.Integer(), sa.ForeignKey("data_providers.id"), nullable=False
        ),
        sa.Column("origin_airport_id", sa.Integer(), sa.ForeignKey("airports.id"), nullable=False),
        sa.Column("destination_id", sa.Integer(), sa.ForeignKey("destinations.id"), nullable=False),
        sa.Column("product_type", sa.String(32), nullable=False, server_default="FLIGHT"),
        sa.Column("departure_month", sa.String(7), nullable=False),
        sa.Column("trip_duration_days", sa.Integer()),
        sa.Column("sample_count", sa.Integer(), nullable=False),
        sa.Column("min_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("p25_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("median_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("p75_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("max_price_pln", sa.Numeric(12, 2), nullable=False),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint(
            "data_provider_id",
            "origin_airport_id",
            "destination_id",
            "product_type",
            "departure_month",
            "trip_duration_days",
            name="uq_route_statistics_bucket",
        ),
    )
    op.create_index(
        "ix_route_statistics_data_provider_id", "route_statistics", ["data_provider_id"]
    )
    op.create_index(
        "ix_route_statistics_origin_airport_id", "route_statistics", ["origin_airport_id"]
    )
    op.create_index("ix_route_statistics_destination_id", "route_statistics", ["destination_id"])
    op.create_index("ix_route_statistics_departure_month", "route_statistics", ["departure_month"])
    op.create_index(
        "ix_route_statistics_route",
        "route_statistics",
        ["origin_airport_id", "destination_id", "departure_month"],
    )


def downgrade() -> None:
    op.drop_table("route_statistics")
