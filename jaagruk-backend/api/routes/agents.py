import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from config.database import get_db
from api.routes.issues import process_issue_pipeline, record_to_dict
from utils.helpers import get_image_bytes
from agents.validator import run_validator
from agents.classifier import run_classifier
from agents.router import run_router
from agents.reporter import run_reporter

router = APIRouter(prefix="/api/agents", tags=["agents"])

class AgentDryRunRequest(BaseModel):
    image_url: str = Field(..., description="Image URL to process")
    description: Optional[str] = Field("", description="Raw description notes")

class RouterDryRunRequest(BaseModel):
    category: str = Field(..., description="Category (ROADS, WATER, SANITATION, ELECTRICAL, OTHER)")
    address: str = Field(..., description="Location address text")

class ReporterDryRunRequest(BaseModel):
    id: str = Field("sample-uuid-1234", description="Simulated Issue ID")
    category: str = Field("ROADS", description="Category")
    address: str = Field("MG Road, Bangalore", description="Location address")
    severity: int = Field(3, description="Severity scale (1-5)")
    priority: str = Field("MEDIUM", description="Priority level")
    refined_description: str = Field("Large pothole causing traffic obstruction", description="Clean description")
    department: str = Field("Public Works Department", description="Target department")

@router.post("/validate")
async def dry_run_validator(request: AgentDryRunRequest):
    """Executes a dry-run of the Validator Agent on a given image URL and description."""
    try:
        image_bytes = await get_image_bytes(request.image_url)
        result = await run_validator(image_bytes, request.description)
        return result
    except Exception as e:
        logging.error(f"Validator dry-run failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validator Agent dry-run failed: {str(e)}"
        )

@router.post("/classify")
async def dry_run_classifier(request: AgentDryRunRequest):
    """Executes a dry-run of the Classifier Agent on a given image URL and description."""
    try:
        image_bytes = await get_image_bytes(request.image_url)
        result = await run_classifier(image_bytes, request.description)
        return result
    except Exception as e:
        logging.error(f"Classifier dry-run failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classifier Agent dry-run failed: {str(e)}"
        )

@router.post("/route")
async def dry_run_router(request: RouterDryRunRequest):
    """Executes a dry-run of the Routing Agent on a category and address."""
    try:
        result = await run_router(request.category, request.address)
        return result
    except Exception as e:
        logging.error(f"Router dry-run failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Routing Agent dry-run failed: {str(e)}"
        )

@router.post("/report")
async def dry_run_reporter(request: ReporterDryRunRequest):
    """Executes a dry-run of the Reporter Agent on structured issue parameters."""
    try:
        result = await run_reporter(request.model_dump())
        return result
    except Exception as e:
        logging.error(f"Reporter dry-run failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reporter Agent dry-run failed: {str(e)}"
        )

@router.post("/trigger/{issue_id}")
async def force_trigger_pipeline(issue_id: UUID, background_tasks: BackgroundTasks, db=Depends(get_db)):
    """Triggers the full collaborative multi-agent pipeline for an existing issue."""
    try:
        record = await db.fetchrow("SELECT * FROM issues WHERE id = $1;", issue_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue record not found."
            )
        
        issue_data = record_to_dict(record)
        
        # Dispatch to background task
        background_tasks.add_task(
            process_issue_pipeline,
            str(issue_id),
            issue_data["image_url"],
            issue_data["description"] or "",
            issue_data["address"] or ""
        )
        
        return {"status": "AI processing pipeline dispatched successfully in the background."}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Pipeline dispatch trigger failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger AI pipeline: {str(e)}"
        )
