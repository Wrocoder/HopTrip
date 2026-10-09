"""Confirmed daily deal alerts; sending remains disabled until explicitly configured."""

import sqlalchemy as sa
from alembic import op

revision = "0014_deal_alerts"
down_revision = "0013_integrity_and_affiliates"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "deal_alerts",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("filters", sa.JSON(), nullable=False),
        sa.Column("consent_version", sa.String(32), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("confirmed_at", sa.DateTime(timezone=True)),
        sa.Column("stopped_at", sa.DateTime(timezone=True)),
        sa.Column("last_digest_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_deal_alerts_status", "deal_alerts", ["status"])
    op.create_table(
        "alert_deliveries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("alert_id", sa.String(32), sa.ForeignKey("deal_alerts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("deal_ids", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_alert_deliveries_alert_id", "alert_deliveries", ["alert_id"])


def downgrade():
    op.drop_table("alert_deliveries")
    op.drop_table("deal_alerts")
