from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingOut
from app.services.booking_service import (
    create_booking, get_bookings_for_user, get_booking_by_id, update_booking_status
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=dict, status_code=201)
def make_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_booking(db, current_user.id, data)


@router.get("", response_model=list[dict])
def list_my_bookings(
    limit: int = Query(100, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return get_bookings_for_user(db, current_user.id, role_str, limit=limit)


@router.get("/{booking_id}", response_model=dict)
def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return get_booking_by_id(db, booking_id, current_user.id, role_str)


@router.put("/{booking_id}/status", response_model=dict)
def change_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return update_booking_status(db, booking_id, current_user.id, role_str, data)

