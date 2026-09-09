from logging.config import fileConfig

from alembic import context

from app.database import Base, database_url, engine


# Alembic configuration object
config = context.config


# Set up logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# SQLAlchemy metadata used by Alembic
# Later this allows Alembic to detect our tables automatically.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without creating a database connection."""

    url = database_url.render_as_string(hide_password=False)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations using our existing SQLAlchemy engine."""

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()