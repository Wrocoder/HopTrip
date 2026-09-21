"""Add tracked affiliate click attempts."""

import sqlalchemy as sa
from alembic import op

revision = "0007_affiliate_clicks"
down_revision = "0006_analytics_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "affiliate_clicks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("deal_id", sa.Integer(), sa.ForeignKey("deals.id"), nullable=False),
        sa.Column("component_type", sa.String(40), nullable=False),
        sa.Column("anonymous_session_id", sa.String(120), nullable=False),
        sa.Column("source", sa.String(80)),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("outbound_host", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_affiliate_clicks_deal_id", "affiliate_clicks", ["deal_id"])
    op.create_index(
        "ix_affiliate_clicks_anonymous_session_id", "affiliate_clicks", ["anonymous_session_id"]
    )
    op.create_index(
        "ix_affiliate_clicks_deal_created", "affiliate_clicks", ["deal_id", "created_at"]
    )
    op.create_index(
        "ix_affiliate_clicks_status_created", "affiliate_clicks", ["status", "created_at"]
    )


def downgrade() -> None:
    op.drop_table("affiliate_clicks")
