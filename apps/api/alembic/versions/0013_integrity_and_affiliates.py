"""Add data identity and affiliate policy without removing existing records.

Legacy duplicates cause unique-index creation to fail and roll back the migration.
Inspect and resolve such records separately; this migration never deletes them.
"""

import sqlalchemy as sa
from alembic import op

revision = "0013_integrity_and_affiliates"
down_revision = "0012_provider_capabilities"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("travel_offers", sa.Column("source_observed_at", sa.DateTime(timezone=True)))
    op.add_column("travel_offers", sa.Column("observation_key", sa.String(64)))
    op.add_column(
        "travel_offers",
        sa.Column("departure_precision", sa.String(8), nullable=False, server_default="TIME"),
    )
    op.create_unique_constraint(
        "uq_offer_provider_external", "travel_offers", ["data_provider_id", "external_id"]
    )
    op.add_column("price_observations", sa.Column("observation_key", sa.String(64)))
    op.create_unique_constraint(
        "uq_price_observations_observation_key", "price_observations", ["observation_key"]
    )
    op.create_index(
        "uq_route_statistics_duration",
        "route_statistics",
        [
            "data_provider_id",
            "origin_airport_id",
            "destination_id",
            "product_type",
            "departure_month",
            sa.text("COALESCE(trip_duration_days, -1)"),
        ],
        unique=True,
    )
    op.create_table(
        "destination_aliases",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider_code", sa.String(80), nullable=False),
        sa.Column("code", sa.String(3), nullable=False),
        sa.Column("kind", sa.String(8), nullable=False),
        sa.Column("destination_id", sa.Integer(), sa.ForeignKey("destinations.id"), nullable=False),
        sa.UniqueConstraint("provider_code", "code", "kind", name="uq_destination_alias"),
    )
    for name in ("capabilities_json", "allowed_hosts"):
        op.add_column(
            "affiliate_programs",
            sa.Column(name, sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        )
    op.add_column("affiliate_programs", sa.Column("tracking_param", sa.String(40)))
    op.add_column(
        "affiliate_programs",
        sa.Column("adapter_code", sa.String(40), nullable=False, server_default="stored_link"),
    )
    op.add_column(
        "deal_components",
        sa.Column("affiliate_program_id", sa.Integer(), sa.ForeignKey("affiliate_programs.id")),
    )
    op.add_column(
        "affiliate_clicks",
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("affiliate_providers.id")),
    )
    op.add_column(
        "affiliate_clicks",
        sa.Column("program_id", sa.Integer(), sa.ForeignKey("affiliate_programs.id")),
    )
    op.add_column("affiliate_clicks", sa.Column("campaign", sa.String(80)))
    op.add_column("deals", sa.Column("depart_at", sa.DateTime(timezone=True)))
    op.add_column(
        "deals", sa.Column("score_version", sa.String(32), nullable=False, server_default="legacy")
    )
    op.add_column(
        "deals",
        sa.Column("score_components", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
    )
    op.add_column(
        "deals",
        sa.Column("explanation_codes", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column("job_runs", sa.Column("run_id", sa.String(36)))
    op.create_index("ix_job_runs_run_id", "job_runs", ["run_id"])
    op.add_column("job_runs", sa.Column("next_retry_at", sa.DateTime(timezone=True)))
    op.add_column("analytics_events", sa.Column("event_id", sa.String(36)))
    op.create_unique_constraint("uq_analytics_events_event_id", "analytics_events", ["event_id"])


def downgrade():
    raise RuntimeError(
        "Restore a verified pre-migration backup to downgrade without silent data loss"
    )
