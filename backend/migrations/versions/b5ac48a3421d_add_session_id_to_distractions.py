"""Add session_id to distractions

Revision ID: b5ac48a3421d
Revises: eb827bdb778f
Create Date: 2025-05-15 18:38:02.756594

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5ac48a3421d'
down_revision: Union[str, None] = 'eb827bdb778f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('distractions', sa.Column('session_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'distractions', 'sessions', ['session_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'distractions', type_='foreignkey')
    op.drop_column('distractions', 'session_id')
    # ### end Alembic commands ###
