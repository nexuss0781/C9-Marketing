from alembic.operations import Operations, MigrationContext

"""
Migration template.

This is a Jinja2 template used to generate new migration scripts.

"""

def upgrade():
    op = Operations(MigrationContext.configure(connection=op.get_bind()))
    ${upgrades}

def downgrade():
    op = Operations(MigrationContext.configure(connection=op.get_bind()))
    ${downgrades}
