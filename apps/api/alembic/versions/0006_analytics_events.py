"""Add first-party analytics events."""

import sqlalchemy as sa
from alembic import op

revision = "0006_analytics_events"
down_revision = "0005_deals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_name", sa.String(40), nullable=False),
        sa.Column("anonymous_session_id", sa.String(120), nullable=False),
        sa.Column("deal_id", sa.Integer(), sa.ForeignKey("deals.id")),
        sa.Column("component", sa.String(40)),
        sa.Column("source", sa.String(80)),
        sa.Column("metadata_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_analytics_events_event_name", "analytics_events", ["event_name"])
    op.create_index(
        "ix_analytics_events_anonymous_session_id", "analytics_events", ["anonymous_session_id"]
    )
    op.create_index("ix_analytics_events_deal_id", "analytics_events", ["deal_id"])
    op.create_index(
        "ix_analytics_events_name_created", "analytics_events", ["event_name", "created_at"]
    )
    op.create_index(
        "ix_analytics_events_session_created",
        "analytics_events",
        ["anonymous_session_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("analytics_events")
