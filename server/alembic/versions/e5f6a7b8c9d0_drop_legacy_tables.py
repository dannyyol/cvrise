"""drop_legacy_tables

Revision ID: e5f6a7b8c9d0
Revises: a1b2c3d4e5f6
Create Date: 2026-02-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop tables in reverse order of dependency
    # Note: websites, languages, interests are skipped as they do not exist in the DB
    
    op.drop_table('custom_section_items')
    op.drop_table('awards')
    op.drop_table('publications')
    op.drop_table('certifications')
    op.drop_table('educations')
    op.drop_table('personal_details')
    op.drop_table('professional_summaries')
    op.drop_table('projects')
    op.drop_table('skills')
    op.drop_table('work_experiences')
    op.drop_table('sections')


def downgrade() -> None:
    # Recreate tables (simplified schema for restoration if needed)
    
    op.create_table('sections',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('resume_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('is_visible', sa.Boolean(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Common columns for section items
    section_fk = sa.ForeignKeyConstraint(['section_id'], ['sections.id'], )
    
    op.create_table('work_experiences',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('company', sa.String(), nullable=False),
        sa.Column('position', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('start_date', sa.String(), nullable=False),
        sa.Column('end_date', sa.String(), nullable=False),
        sa.Column('current', sa.Boolean(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('skills',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('level', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('projects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('technologies', sa.JSON(), nullable=False),
        sa.Column('link', sa.String(), nullable=False),
        sa.Column('start_date', sa.String(), nullable=False),
        sa.Column('end_date', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('professional_summaries',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('personal_details',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('job_title', sa.String(), nullable=False),
        sa.Column('website', sa.String(), nullable=False),
        sa.Column('linkedin', sa.String(), nullable=False),
        sa.Column('github', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('educations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('institution', sa.String(), nullable=False),
        sa.Column('degree', sa.String(), nullable=False),
        sa.Column('field_of_study', sa.String(), nullable=False),
        sa.Column('start_date', sa.String(), nullable=False),
        sa.Column('end_date', sa.String(), nullable=False),
        sa.Column('current', sa.Boolean(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('certifications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('issuer', sa.String(), nullable=False),
        sa.Column('issue_date', sa.String(), nullable=False),
        sa.Column('expiry_date', sa.String(), nullable=False),
        sa.Column('credential_id', sa.String(), nullable=False),
        sa.Column('link', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('publications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('publisher', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('link', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('awards',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('issuer', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('custom_section_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('section_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        section_fk,
        sa.PrimaryKeyConstraint('id')
    )
