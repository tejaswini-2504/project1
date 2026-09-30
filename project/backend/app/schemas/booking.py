from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel
from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    provider_id: int
    service_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    estimated_amount: Optional[float] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    note: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    customer_id: int
    provider_id: int
    service_id: Optional[int] = None
    status: BookingStatus
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    address: Optional[str] = None
    estimated_amount: Optional[float] = None
    total_amount: Optional[float] = None
    customer_notes: Optional[str] = None
    is_paid: bool
    created_at: datetime

    # Joined fields
    customer_name: Optional[str] = None
    provider_name: Optional[str] = None
    service_name: Optional[str] = None

    model_config = {"from_attributes": True}
