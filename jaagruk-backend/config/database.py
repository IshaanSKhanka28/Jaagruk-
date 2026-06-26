import os
import logging
import asyncpg
from dotenv import load_dotenv

# Load env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables.")

# Global connection pool variable
pool = None

async def init_db():
    """Initializes the database pool and creates necessary tables."""
    global pool
    logging.info("Initializing database connection pool...")
    try:
        if not pool:
            # Supabase connection pools can benefit from connection parameters
            pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10, statement_cache_size=0)
        
        async with pool.acquire() as conn:
            # Enable pgcrypto extension for gen_random_uuid()
            await conn.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            
            # Create issues table if not exists
            create_table_query = """
            CREATE TABLE IF NOT EXISTS issues (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                citizen_id TEXT DEFAULT 'anonymous',
                image_url TEXT NOT NULL,
                description TEXT,
                address TEXT,
                lat FLOAT,
                lng FLOAT,
                category TEXT DEFAULT 'OTHER',
                severity INTEGER DEFAULT 1,
                department TEXT DEFAULT '',
                priority TEXT DEFAULT 'LOW',
                status TEXT DEFAULT 'OPEN',
                upvotes INTEGER DEFAULT 0,
                upvoted_by TEXT[] DEFAULT '{}',
                agent_log JSONB DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                resolved_at TIMESTAMPTZ
            );
            """
            await conn.execute(create_table_query)
            logging.info("Database initialized and 'issues' table verified.")
    except Exception as e:
        logging.error(f"Error initializing database: {e}")
        raise e

async def get_db():
    """Dependency generator that yields a database connection from the pool."""
    global pool
    if not pool:
        pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10, statement_cache_size=0)
    
    async with pool.acquire() as conn:
        yield conn

async def close_db():
    """Closes the connection pool."""
    global pool
    if pool:
        logging.info("Closing database connection pool...")
        await pool.close()
        pool = None
