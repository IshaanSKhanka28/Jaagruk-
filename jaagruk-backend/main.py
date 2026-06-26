import os
import sys
import uvicorn
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use UTF-8 to prevent UnicodeEncodeError in Windows CP1252 consoles
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load env variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

from config.database import init_db, close_db
from api.routes.upload import router as upload_router
from api.routes.issues import router as issues_router, dashboard_router
from api.routes.agents import router as agents_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logging.info("Initializing database connections...")
    await init_db()
    try:
        print("🌐 Jaagruk is live")
    except UnicodeEncodeError:
        print("Jaagruk is live")
    yield
    # Shutdown actions
    logging.info("Tearing down database connections...")
    await close_db()

app = FastAPI(
    title="Jaagruk Backend API",
    description="AI-powered civic issue reporting and verification system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload_router)
app.include_router(issues_router)
app.include_router(dashboard_router)
app.include_router(agents_router)

@app.get("/")
async def root():
    """Server status endpoint."""
    return {
        "status": "Jaagruk API is live 🌐",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    # Run server locally
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
