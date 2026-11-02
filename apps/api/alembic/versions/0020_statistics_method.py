"""Distinguish validated historical cohorts from unverified derived cache."""
import sqlalchemy as sa
from alembic import op

revision = "0020_statistics_method"
down_revision = "0019_observation_expiry"
branch_labels = None
depends_on = None


def upgrade():
    # Only a real recalculation can certify the sample; legacy cache remains NULL.
    op.add_column("route_statistics", sa.Column("methodology_version", sa.String(40), nullable=True))


def downgrade():
    op.drop_column("route_statistics", "methodology_version")
