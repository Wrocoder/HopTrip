"""Add provider sub-ID tracking to affiliate clicks."""

import sqlalchemy as sa
from alembic import op

revision = "0011_affiliate_click_tracking"
down_revision = "0010_affiliate_conversions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("affiliate_clicks", sa.Column("tracking_id", sa.String(120)))
    op.create_index("ix_affiliate_clicks_tracking_id", "affiliate_clicks", ["tracking_id"])


def downgrade() -> None:
    op.drop_index("ix_affiliate_clicks_tracking_id", table_name="affiliate_clicks")
    op.drop_column("affiliate_clicks", "tracking_id")
