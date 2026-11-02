"""Separate opt-in personal Telegram subscriptions, receipts and delivery journal."""
import sqlalchemy as sa
from alembic import op

revision = '0021_telegram_alerts'
down_revision = '0020_statistics_method'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('telegram_subscriptions',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('chat_id', sa.BigInteger(), nullable=False, unique=True),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(16), nullable=False),
        sa.Column('locale', sa.String(2), nullable=False),
        sa.Column('filters', sa.JSON(), nullable=False),
        sa.Column('consent_version', sa.String(40)),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('opted_in_at', sa.DateTime(timezone=True)),
        sa.Column('stopped_at', sa.DateTime(timezone=True)),
        sa.Column('last_digest_at', sa.DateTime(timezone=True)),
        sa.Column('last_update_id', sa.BigInteger(), nullable=False))
    op.create_index('ix_telegram_subscriptions_status', 'telegram_subscriptions', ['status'])
    op.create_table('telegram_updates',
        sa.Column('update_id', sa.BigInteger(), primary_key=True),
        sa.Column('chat_id', sa.BigInteger(), nullable=False),
        sa.Column('received_at', sa.DateTime(timezone=True), nullable=False))
    for name in ['chat_id', 'received_at']:
        op.create_index('ix_telegram_updates_' + name, 'telegram_updates', [name])
    op.create_table('telegram_deliveries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('subscription_id', sa.String(32),
                  sa.ForeignKey('telegram_subscriptions.id', ondelete='CASCADE')),
        sa.Column('chat_id', sa.BigInteger(), nullable=False),
        sa.Column('kind', sa.String(8), nullable=False),
        sa.Column('status', sa.String(16), nullable=False),
        sa.Column('deal_ids', sa.JSON(), nullable=False),
        sa.Column('filters', sa.JSON()),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('due_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('attempted_at', sa.DateTime(timezone=True)),
        sa.Column('attempts', sa.Integer(), nullable=False))
    for name in ['subscription_id', 'chat_id', 'status', 'attempted_at']:
        op.create_index('ix_telegram_deliveries_' + name, 'telegram_deliveries', [name])


def downgrade():
    # Explicit rollback only: removes Telegram data, never the existing email tables.
    op.drop_table('telegram_deliveries')
    op.drop_table('telegram_updates')
    op.drop_table('telegram_subscriptions')
