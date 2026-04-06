import typer
import asyncio
import logging
import sys
import os

# Add the current directory to sys.path to allow imports from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database import SessionLocal
from src.config import get_settings
from src.seeders.templates import TemplateSeeder
from src.seeders.resumes import ResumeSeeder
from src.seeders.cover_letter_templates import CoverLetterTemplateSeeder
from src.seeders.ai_models import AIModelSeeder
from src.seeders.resume_data_migration import ResumeDataMigrationSeeder
from src.seeders.billing import BillingSeeder
from alembic import command
from alembic.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = typer.Typer()

SEEDERS = {
    "templates": TemplateSeeder,
    "cover_letter_templates": CoverLetterTemplateSeeder,
    "resumes": ResumeSeeder,
    "ai_models": AIModelSeeder,
    "resume_data_migration": ResumeDataMigrationSeeder,
    "billing": BillingSeeder,
}

def get_alembic_config():
    """
    Get the Alembic configuration.
    Assumes alembic.ini is in the current working directory or parent directory.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
    return alembic_cfg

async def run_specific_seeder(name: str):
    seeder_cls = SEEDERS.get(name)
    if not seeder_cls:
        logger.error(f"Seeder '{name}' not found.")
        return
    
    async with SessionLocal() as session:
        try:
            logger.info(f"Running seeder: {name}")
            await seeder_cls().run(session)
            logger.info(f"Seeder {name} completed.")
        except Exception as e:
            logger.error(f"Seeder {name} failed: {e}")
            raise

async def run_all_seeders():
    async with SessionLocal() as session:
        for name, seeder_cls in SEEDERS.items():
            try:
                logger.info(f"Running seeder: {name}")
                await seeder_cls().run(session)
            except Exception as e:
                logger.error(f"Seeder {name} failed: {e}")
                raise
        logger.info("All seeders completed successfully.")

@app.command()
def seed(name: str = typer.Argument(None, help="Name of the specific seeder to run. Runs all if omitted.")):
    """
    Seed the database with initial data.
    """
    if name:
        asyncio.run(run_specific_seeder(name))
    else:
        asyncio.run(run_all_seeders())

@app.command()
def refresh(seed_data: bool = typer.Option(True, help="Whether to seed the database after refresh.")):
    """
    Refresh the database (downgrade to base, upgrade to head, and optionally seed).
    """
    try:
        alembic_cfg = get_alembic_config()
        
        logger.info("Downgrading database to base...")
        command.downgrade(alembic_cfg, "base")
        
        logger.info("Upgrading database to heads...")
        command.upgrade(alembic_cfg, "heads")
        
        if seed_data:
            logger.info("Seeding database...")
            asyncio.run(run_all_seeders())
            
        logger.info("Database refresh completed successfully.")
        
    except Exception as e:
        logger.error(f"Database refresh failed: {e}")
        raise

@app.command()
def reset():
    """
    Reset the database: Drop all tables and recreate them empty (no seeding).
    Handles SQLite by removing the file directly.
    """
    settings = get_settings()
    if settings.DATABASE_URL.startswith("sqlite"):
        # Handle SQLite specifically to avoid sync issues
        path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        if path.startswith("./"):
            path = path[2:]
        
        if os.path.exists(path):
            logger.info(f"Removing SQLite database file: {path}")
            os.remove(path)
        
        logger.info("Upgrading database to heads...")
        alembic_cfg = get_alembic_config()
        command.upgrade(alembic_cfg, "heads")
        logger.info("Database reset completed (empty tables).")
    else:
        refresh(seed_data=False)

@app.command()
def drop():
    """
    Drop all tables from the database.
    """
    settings = get_settings()
    if settings.DATABASE_URL.startswith("sqlite"):
        path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        if path.startswith("./"):
            path = path[2:]
        
        if os.path.exists(path):
            logger.info(f"Removing SQLite database file: {path}")
            os.remove(path)
            logger.info("All tables dropped (file removed).")
        else:
            logger.info("Database file not found.")
    else:
        try:
            alembic_cfg = get_alembic_config()
            logger.info("Dropping all tables (downgrading to base)...")
            command.downgrade(alembic_cfg, "base")
            logger.info("All tables dropped.")
        except Exception as e:
            logger.error(f"Failed to drop tables: {e}")
            raise

if __name__ == "__main__":
    app()
