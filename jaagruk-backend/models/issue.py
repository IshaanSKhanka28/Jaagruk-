from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class AgentLog(BaseModel):
    agent: str = Field(..., description="Name of the agent (e.g. Validator, Classifier)")
    action: str = Field(..., description="Action taken by the agent")
    output: str = Field(..., description="Details of the agent's output or response")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time the log was generated")

class Location(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None

class IssueCreate(BaseModel):
    image_url: str = Field(..., description="URL of the uploaded civic issue image")
    description: Optional[str] = Field(None, description="Citizen's raw description of the issue")
    lat: Optional[float] = Field(None, description="Latitude coordinate")
    lng: Optional[float] = Field(None, description="Longitude coordinate")
    address: Optional[str] = Field(None, description="Civic address location")
    citizen_id: str = Field("anonymous", description="ID of the reporting citizen")

class IssueUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Lifecycle status (OPEN, IN_PROGRESS, RESOLVED, REJECTED)")
    category: Optional[str] = Field(None, description="Issue category (ROADS, WATER, SANITATION, ELECTRICAL, OTHER)")
    severity: Optional[int] = Field(None, description="Estimated severity level (1-5)")
    priority: Optional[str] = Field(None, description="Calculated priority level (LOW, MEDIUM, HIGH, URGENT)")
    department: Optional[str] = Field(None, description="Assigned municipal department")
    resolved_at: Optional[datetime] = None

class IssueResponse(BaseModel):
    id: UUID
    citizen_id: str
    image_url: str
    description: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    category: str
    severity: int
    department: str
    priority: str
    status: str
    upvotes: int
    upvoted_by: List[str]
    agent_log: List[dict]  # Stored as JSONB in DB
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
