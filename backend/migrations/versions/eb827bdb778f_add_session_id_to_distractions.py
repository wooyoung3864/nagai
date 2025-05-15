"""Add session_id to distractions

Revision ID: eb827bdb778f
Revises: 3c8a6974499f
Create Date: 2025-05-15 18:32:19.808743

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eb827bdb778f'
down_revision: Union[str, None] = '3c8a6974499f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
