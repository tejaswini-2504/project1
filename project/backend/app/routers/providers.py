from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user, get_current_provider
from app.models.user import User
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderOut
from app.schemas.review import ReviewOut
from app.services.provider_service import (
    get_providers, get_provider_by_id, create_or_update_provider, get_provider_by_user_id
)
from app.services.payment_service import get_payments_for_provider

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=list[dict])
def list_providers(
    category: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    service_name: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
):
    return get_providers(db, category=category, search=search, service_name=service_name, limit=limit)


@router.get("/me", response_model=dict)
def get_my_provider_profile(
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    p = get_provider_by_user_id(db, current_user.id)
    if not p:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    return get_provider_by_id(db, p.id)


@router.post("/me", response_model=dict)
def upsert_my_provider_profile(
    data: ProviderCreate,
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    p = create_or_update_provider(db, current_user.id, data)
    return get_provider_by_id(db, p.id)


@router.get("/my/earnings")
def get_my_earnings(
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    p = get_provider_by_user_id(db, current_user.id)
    if not p:
        return {"total": 0, "this_month": 0, "bookings": []}
    return get_payments_for_provider(db, p.id)


@router.get("/{provider_id}", response_model=dict)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    p = get_provider_by_id(db, provider_id)
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    return p


@router.get("/{provider_id}/reviews", response_model=list[dict])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    from app.models.review import Review
    from app.models.user import User as UserModel
    reviews = db.query(Review).filter(
        Review.provider_id == provider_id,
        Review.is_visible == True
    ).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        customer = db.query(UserModel).filter(UserModel.id == r.customer_id).first()
        result.append({
            "id": r.id,
            "booking_id": r.booking_id,
            "customer_id": r.customer_id,
            "provider_id": r.provider_id,
            "rating": r.rating,
            "comment": r.comment,
            "customer_name": customer.full_name if customer else "Customer",
            "created_at": r.created_at,
        })
    return result
