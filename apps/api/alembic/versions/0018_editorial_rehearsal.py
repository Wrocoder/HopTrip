"""Persist scheduled dry-run rehearsals; never authorizes external delivery."""
import sqlalchemy as sa
from alembic import op

revision = "0018_editorial_rehearsal"
down_revision = "0017_routes_editorial_merge"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("editorial_rehearsals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("editorial_items.id"), nullable=False),
        sa.Column("revision_id", sa.Integer(), sa.ForeignKey("editorial_revisions.id"), nullable=False),
        sa.Column("approval_id", sa.Integer(), sa.ForeignKey("editorial_approvals.id"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("channels", sa.JSON(), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("state", sa.String(20), nullable=False),
        sa.Column("reason", sa.String(500)),
        sa.Column("package", sa.JSON()),
        sa.Column("owner", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("checked_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("revision_id", name="uq_editorial_rehearsal_revision"))
    op.create_index("ix_editorial_rehearsals_item_id", "editorial_rehearsals", ["item_id"])
    op.create_index("ix_editorial_rehearsals_scheduled_at", "editorial_rehearsals", ["scheduled_at"])


def downgrade():
    op.drop_table("editorial_rehearsals")
