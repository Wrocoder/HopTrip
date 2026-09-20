"""Track affiliate provider capabilities and health errors."""

import sqlalchemy as sa
from alembic import op

revision = "0012_provider_capabilities"
down_revision = "0011_affiliate_click_tracking"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "affiliate_providers",
        sa.Column("capabilities_json", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column("affiliate_providers", sa.Column("last_health_check_error", sa.Text()))


def downgrade() -> None:
    op.drop_column("affiliate_providers", "last_health_check_error")
    op.drop_column("affiliate_providers", "capabilities_json")
