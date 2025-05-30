"""Initial models

Revision ID: 7576dd0529ff
Revises: 89605ce71069
Create Date: 2025-05-13 15:22:45.562167

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7576dd0529ff'
down_revision: Union[str, None] = '89605ce71069'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('secret_keys',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('service', sa.String(), nullable=False),
    sa.Column('key_name', sa.String(), nullable=True),
    sa.Column('key_value', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('google_id', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('last_login', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('google_id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('oauth_services',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('provider', sa.String(), nullable=True),
    sa.Column('token', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sessions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('type', sa.Enum('FOCUS', 'BREAK', name='sessiontype'), nullable=False),
    sa.Column('start_time', sa.DateTime(), nullable=True),
    sa.Column('end_time', sa.DateTime(), nullable=True),
    sa.Column('status', sa.Enum('RUNNING', 'PAUSED', 'STOPPED', name='sessionstatus'), nullable=True),
    sa.Column('focus_secs', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('distractions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('session_id', sa.Integer(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('snapshot_url', sa.String(), nullable=True),
    sa.Column('storage_path', sa.String(), nullable=True),
    sa.Column('expires_at', sa.Integer(), nullable=True),
    sa.Column('focus_score', sa.Integer(), nullable=True),
    sa.Column('hawon_park', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('focus_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('session_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('focus_secs', sa.Integer(), nullable=False),
    sa.Column('focus_score', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('focus_events')
    op.drop_table('distractions')
    op.drop_table('sessions')
    op.drop_table('oauth_services')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    op.drop_table('secret_keys')
    # ### end Alembic commands ###
