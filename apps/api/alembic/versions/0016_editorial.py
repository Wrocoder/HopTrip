"""Private editorial drafts, immutable revisions, sessions and approval audit."""
import sqlalchemy as sa
from alembic import op

revision = "0016_editorial"
down_revision = "0015_events_catalog"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("editor_sessions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("csrf_token", sa.String(64), nullable=False),
        sa.Column("owner", sa.String(100), nullable=False),
        sa.Column("credential_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_editor_sessions_expires_at", "editor_sessions", ["expires_at"])
    op.create_table("editorial_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(20), nullable=False),
        sa.Column("source", sa.JSON(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False))
    for table, extra in [
        ("editorial_revisions", [sa.Column("snapshot", sa.JSON(), nullable=False),
            sa.Column("variants", sa.JSON(), nullable=False),
            sa.Column("artifacts", sa.JSON(), nullable=False),
            sa.Column("checksum", sa.String(64), nullable=False),
            sa.UniqueConstraint("item_id", "version", name="uq_editorial_revision")]),
        ("editorial_audit", [sa.Column("action", sa.String(30), nullable=False),
            sa.Column("details", sa.JSON(), nullable=False)]),
        ("editorial_approvals", [sa.Column("channels", sa.JSON(), nullable=False),
            sa.Column("checksum", sa.String(64), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.UniqueConstraint("item_id", "version", name="uq_editorial_approval")]),
    ]:
        op.create_table(table,
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("item_id", sa.Integer(), sa.ForeignKey("editorial_items.id"), nullable=False),
            sa.Column("version", sa.Integer(), nullable=False),
            sa.Column("owner", sa.String(100), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), *extra)
    for table in ("editorial_revisions", "editorial_audit"):
        op.create_index(f"ix_{table}_item_id", table, ["item_id"])


def downgrade():
    for table in ("editorial_approvals", "editorial_audit", "editorial_revisions",
                  "editorial_items", "editor_sessions"):
        op.drop_table(table)
