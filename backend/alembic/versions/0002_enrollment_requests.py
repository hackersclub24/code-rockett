"""add enrollment request review fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-12

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "enrollments",
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
    )
    op.add_column("enrollments", sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("enrollments", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(None, "enrollments", "users", ["reviewed_by"], ["id"])
    op.alter_column("enrollments", "status", server_default=None)


def downgrade() -> None:
    op.drop_constraint(op.f("enrollments_reviewed_by_fkey"), "enrollments", type_="foreignkey")
    op.drop_column("enrollments", "reviewed_at")
    op.drop_column("enrollments", "reviewed_by")
    op.drop_column("enrollments", "status")
