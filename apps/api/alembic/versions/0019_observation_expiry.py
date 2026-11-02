"""Retain cached observation deadlines across intervening price changes."""
import sqlalchemy as sa
from alembic import op

revision = "0019_observation_expiry"
down_revision = "0018_editorial_rehearsal"
branch_labels = None
depends_on = None


def upgrade():
    # Unknown historical deadlines stay unknown; do not infer them from delivery time.
    op.add_column("price_observations", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column("price_observations", "expires_at")
