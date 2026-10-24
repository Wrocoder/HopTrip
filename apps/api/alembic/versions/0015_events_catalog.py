"""Persistent event catalog and successful city/date coverage."""
import sqlalchemy as sa
from alembic import op

revision = '0015_events_catalog'
down_revision = '0014_deal_alerts'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source', sa.String(40), nullable=False),
        sa.Column('external_id', sa.String(200), nullable=False),
        sa.Column('destination_id', sa.Integer(), sa.ForeignKey('destinations.id'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('source', 'external_id', name='uq_events_source_external'),
    )
    op.create_index('ix_events_destination_dates', 'events', ['destination_id', 'start_date', 'end_date'])
    op.create_index('ix_events_checked', 'events', ['checked_at'])
    op.create_table('event_sync_windows',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('destination_id', sa.Integer(), sa.ForeignKey('destinations.id'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True)),
        sa.Column('attempted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.UniqueConstraint('destination_id', 'start_date', 'end_date', name='uq_event_sync_window'),
    )


def downgrade():
    op.drop_table('event_sync_windows')
    op.drop_table('events')
