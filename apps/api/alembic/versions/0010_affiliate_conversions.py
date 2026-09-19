"""Add affiliate conversion and revenue records."""

import sqlalchemy as sa
from alembic import op

revision = "0010_affiliate_conversions"
down_revision = "0009_job_runs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "affiliate_conversions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider_code", sa.String(80), nullable=False),
        sa.Column("program_code", sa.String(80)),
        sa.Column("provider_conversion_id", sa.String(160), nullable=False),
        sa.Column("click_id", sa.Integer(), sa.ForeignKey("affiliate_clicks.id")),
        sa.Column("deal_id", sa.Integer(), sa.ForeignKey("deals.id")),
        sa.Column("booking_category", sa.String(40), nullable=False),
        sa.Column("booking_value", sa.Numeric(12, 2)),
        sa.Column("commission", sa.Numeric(12, 2)),
        sa.Column("currency", sa.String(3), nullable=False, server_default="PLN"),
        sa.Column("status", sa.String(32), nullable=False, server_default="PENDING"),
        sa.Column("occurred_at", sa.DateTime(timezone=True)),
        sa.Column("confirmed_at", sa.DateTime(timezone=True)),
        sa.Column("metadata_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint(
            "provider_code",
            "provider_conversion_id",
            name="uq_affiliate_conversions_provider_id",
        ),
    )
    op.create_index("ix_affiliate_conversions_provider_code", "affiliate_conversions", ["provider_code"])
    op.create_index("ix_affiliate_conversions_program_code", "affiliate_conversions", ["program_code"])
    op.create_index("ix_affiliate_conversions_click_id", "affiliate_conversions", ["click_id"])
    op.create_index("ix_affiliate_conversions_deal_id", "affiliate_conversions", ["deal_id"])
    op.create_index("ix_affiliate_conversions_status", "affiliate_conversions", ["status"])
    op.create_index(
        "ix_affiliate_conversions_status_created",
        "affiliate_conversions",
        ["status", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("affiliate_conversions")
