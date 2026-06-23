# Routes package initializer
from .upload import router as upload_router
from .issues import router as issues_router
from .agents import router as agents_router

__all__ = ["upload_router", "issues_router", "agents_router"]
