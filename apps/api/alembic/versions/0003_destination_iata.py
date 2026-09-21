"""Add optional IATA city code for destination resolution."""

import sqlalchemy as sa
from alembic import op

revision = "0003_destination_iata"
down_revision = "0002_offers_and_price_history"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("destinations", sa.Column("iata_code", sa.String(3)))
    op.create_index("ix_destinations_iata_code", "destinations", ["iata_code"])


def downgrade() -> None:
    op.drop_index("ix_destinations_iata_code", table_name="destinations")
    op.drop_column("destinations", "iata_code")
