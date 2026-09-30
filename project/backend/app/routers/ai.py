from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.ai.ai_service import analyze_problem, get_price_estimate
from app.models.ai_request import AIRequest

router = APIRouter(prefix="/ai", tags=["AI"])


class HelpRequest(BaseModel):
    problem: str
    location: Optional[str] = ""


class EstimateRequest(BaseModel):
    service_id: Optional[int] = None
    service_name: Optional[str] = ""
    details: Optional[str] = ""


@router.post("/help")
def ai_help(data: HelpRequest, db: Session = Depends(get_db)):
    result = analyze_problem(data.problem, data.location or "")

    # Log the AI request
    log = AIRequest(
        problem_text=data.problem,
        detected_category=result["category"],
        detected_service=result["service"],
        urgency=result["urgency"],
        confidence=result["confidence"],
    )
    db.add(log)
    db.commit()

    return result


@router.post("/estimate")
def ai_estimate(data: EstimateRequest):
    service_name = data.service_name or ""
    return get_price_estimate(service_name, data.details or "")
