import json
import logging
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from config.database import get_db, pool
from models.issue import IssueCreate, IssueResponse, IssueUpdate
from utils.helpers import generate_pdf_report, get_image_bytes
from agents.validator import run_validator
from agents.classifier import run_classifier
from agents.router import run_router
from agents.reporter import run_reporter

router = APIRouter(prefix="/api/issues", tags=["issues"])

def record_to_dict(record) -> Optional[dict]:
    """Helper to convert asyncpg Record to dict and parse JSONB field."""
    if not record:
        return None
    d = dict(record)
    if "agent_log" in d and isinstance(d["agent_log"], str):
        try:
            d["agent_log"] = json.loads(d["agent_log"])
        except Exception:
            d["agent_log"] = []
    elif "agent_log" in d and d["agent_log"] is None:
        d["agent_log"] = []
    return d

async def process_issue_pipeline(issue_id: str, image_url: str, raw_description: str, address: str):
    """Background worker executing the collaborative multi-agent pipeline."""
    logging.info(f"Starting background AI pipeline for issue {issue_id}")
    agent_log = []
    
    try:
        # 1. Download image bytes
        image_bytes = await get_image_bytes(image_url)
        
        # 2. Run Validator Agent
        val_start = datetime.utcnow()
        val_result = await run_validator(image_bytes, raw_description)
        agent_log.append({
            "agent": "Validator Agent",
            "action": "Validated image and description",
            "output": val_result,
            "timestamp": val_start.isoformat()
        })
        
        if not val_result.get("valid", True):
            # Issue is rejected
            logging.info(f"Issue {issue_id} rejected by Validator Agent: {val_result.get('reason')}")
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE issues
                    SET status = 'REJECTED', agent_log = $1, updated_at = NOW()
                    WHERE id = $2
                    """,
                    json.dumps(agent_log),
                    UUID(issue_id)
                )
            return
        
        # 3. Run Classifier Agent
        class_start = datetime.utcnow()
        class_result = await run_classifier(image_bytes, raw_description)
        agent_log.append({
            "agent": "Classifier Agent",
            "action": "Classified category, severity index, and priority",
            "output": class_result,
            "timestamp": class_start.isoformat()
        })
        
        category = class_result.get("category", "OTHER")
        severity = class_result.get("severity", 1)
        priority = class_result.get("priority", "LOW")
        refined_description = class_result.get("refined_description", raw_description)
        
        # 4. Run Routing Agent
        route_start = datetime.utcnow()
        route_result = await run_router(category, address)
        agent_log.append({
            "agent": "Routing Agent",
            "action": "Determined target department and officer role",
            "output": route_result,
            "timestamp": route_start.isoformat()
        })
        
        department = route_result.get("department", "General Municipal Administration")
        
        # 5. Run Reporter Agent
        report_start = datetime.utcnow()
        report_data = {
            "id": issue_id,
            "category": category,
            "address": address,
            "severity": severity,
            "priority": priority,
            "refined_description": refined_description,
            "department": department
        }
        report_result = await run_reporter(report_data)
        agent_log.append({
            "agent": "Reporter Agent",
            "action": "Generated formal grievance letter text",
            "output": report_result,
            "timestamp": report_start.isoformat()
        })
        
        # Save pipeline outputs and update status/description
        async with pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE issues
                SET category = $1, severity = $2, priority = $3, department = $4,
                    description = $5, agent_log = $6, updated_at = NOW()
                WHERE id = $7
                """,
                category,
                severity,
                priority,
                department,
                refined_description,
                json.dumps(agent_log),
                UUID(issue_id)
            )
        logging.info(f"AI pipeline completed successfully for issue {issue_id}")
    except Exception as e:
        logging.error(f"Failed to process AI pipeline for issue {issue_id}: {e}")
        agent_log.append({
            "agent": "Pipeline Orchestrator",
            "action": "Failed with error",
            "output": {"error": str(e)},
            "timestamp": datetime.utcnow().isoformat()
        })
        async with pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE issues
                SET agent_log = $1, updated_at = NOW()
                WHERE id = $2
                """,
                json.dumps(agent_log),
                UUID(issue_id)
            )

@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(issue: IssueCreate, background_tasks: BackgroundTasks, db=Depends(get_db)):
    """Creates a new civic issue report and triggers the asynchronous multi-agent pipeline."""
    try:
        query = """
        INSERT INTO issues (citizen_id, image_url, description, address, lat, lng, agent_log)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        """
        initial_log = [{
            "agent": "System Gateway",
            "action": "Received citizen report",
            "output": "Registration success. Triggering AI analysis pipeline.",
            "timestamp": datetime.utcnow().isoformat()
        }]
        
        record = await db.fetchrow(
            query,
            issue.citizen_id,
            issue.image_url,
            issue.description,
            issue.address,
            issue.lat,
            issue.lng,
            json.dumps(initial_log)
        )
        
        result_dict = record_to_dict(record)
        
        # Enqueue pipeline run as a background task
        background_tasks.add_task(
            process_issue_pipeline,
            str(result_dict["id"]),
            issue.image_url,
            issue.description or "",
            issue.address or ""
        )
        
        return result_dict
    except Exception as e:
        logging.error(f"Failed to create issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit issue: {str(e)}"
        )

@router.get("", response_model=List[IssueResponse])
async def list_issues(category: Optional[str] = None, status: Optional[str] = None, db=Depends(get_db)):
    """Retrieves all civic issues, optionally filtered by category or status."""
    try:
        query = "SELECT * FROM issues WHERE 1=1"
        args = []
        
        if category:
            args.append(category)
            query += f" AND category = ${len(args)}"
        if status:
            args.append(status)
            query += f" AND status = ${len(args)}"
            
        query += " ORDER BY created_at DESC;"
        
        records = await db.fetch(query, *args)
        return [record_to_dict(r) for r in records]
    except Exception as e:
        logging.error(f"Failed to list issues: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve issues: {str(e)}"
        )

@router.get("/{id}", response_model=IssueResponse)
async def get_issue(id: UUID, db=Depends(get_db)):
    """Retrieves the details of a specific civic issue by UUID."""
    try:
        record = await db.fetchrow("SELECT * FROM issues WHERE id = $1;", id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found."
            )
        return record_to_dict(record)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to fetch issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve issue details: {str(e)}"
        )

@router.put("/{id}", response_model=IssueResponse)
async def update_issue(id: UUID, issue_update: IssueUpdate, db=Depends(get_db)):
    """Updates issue details such as status, category, severity index, or target department."""
    try:
        # Fetch current record
        current = await db.fetchrow("SELECT * FROM issues WHERE id = $1;", id)
        if not current:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found."
            )
        
        current_dict = dict(current)
        
        # Calculate new updates
        status_val = issue_update.status or current_dict["status"]
        category_val = issue_update.category or current_dict["category"]
        severity_val = issue_update.severity if issue_update.severity is not None else current_dict["severity"]
        priority_val = issue_update.priority or current_dict["priority"]
        department_val = issue_update.department or current_dict["department"]
        
        resolved_at_val = current_dict["resolved_at"]
        if issue_update.status == "RESOLVED":
            resolved_at_val = datetime.utcnow()
        elif issue_update.status and issue_update.status != "RESOLVED":
            resolved_at_val = None
        if issue_update.resolved_at is not None:
            resolved_at_val = issue_update.resolved_at

        # Append audit trail log
        agent_log = json.loads(current_dict["agent_log"]) if isinstance(current_dict["agent_log"], str) else (current_dict["agent_log"] or [])
        agent_log.append({
            "agent": "System Override",
            "action": "Updated issue parameters",
            "output": f"Status: {status_val}, Category: {category_val}, Severity: {severity_val}, Priority: {priority_val}, Dept: {department_val}",
            "timestamp": datetime.utcnow().isoformat()
        })

        query = """
        UPDATE issues
        SET status = $1, category = $2, severity = $3, priority = $4, department = $5,
            resolved_at = $6, agent_log = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *;
        """
        record = await db.fetchrow(
            query,
            status_val,
            category_val,
            severity_val,
            priority_val,
            department_val,
            resolved_at_val,
            json.dumps(agent_log),
            id
        )
        return record_to_dict(record)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update issue parameters: {str(e)}"
        )

@router.post("/{id}/upvote", response_model=IssueResponse)
async def upvote_issue(id: UUID, citizen_id: str, db=Depends(get_db)):
    """Toggles a citizen's upvote on a civic issue."""
    try:
        record = await db.fetchrow("SELECT upvoted_by FROM issues WHERE id = $1;", id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found."
            )
        
        upvoted_by = record["upvoted_by"] or []
        
        if citizen_id in upvoted_by:
            # Remove upvote
            update_query = """
            UPDATE issues
            SET upvotes = upvotes - 1, upvoted_by = array_remove(upvoted_by, $1), updated_at = NOW()
            WHERE id = $2
            RETURNING *;
            """
        else:
            # Add upvote
            update_query = """
            UPDATE issues
            SET upvotes = upvotes + 1, upvoted_by = array_append(upvoted_by, $1), updated_at = NOW()
            WHERE id = $2
            RETURNING *;
            """
        
        updated_record = await db.fetchrow(update_query, citizen_id, id)
        return record_to_dict(updated_record)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Upvoting process encountered error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to modify upvote: {str(e)}"
        )

@router.get("/{id}/pdf")
async def download_issue_pdf(id: UUID, db=Depends(get_db)):
    """Compiles and streams the formal ReportLab PDF complaint document for download."""
    try:
        record = await db.fetchrow("SELECT * FROM issues WHERE id = $1;", id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found."
            )
        
        issue_data = record_to_dict(record)
        
        # Generate the PDF file bytes
        pdf_bytes = generate_pdf_report(issue_data)
        
        # Stream back as response
        filename = f"jaagruk_report_{str(id)[:8]}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to generate PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF report: {str(e)}"
        )
