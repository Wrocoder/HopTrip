"""Separate route evidence from cached price observations."""
import sqlalchemy as sa
from alembic import op

revision = "0016_flight_route_details"
down_revision = "0015_events_catalog"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("travel_offers", sa.Column("route_details", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("travel_offers", "route_details")
