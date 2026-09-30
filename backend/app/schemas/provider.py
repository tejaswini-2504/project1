from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ProviderCreate(BaseModel):
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category_id: Optional[int] = None
    service_area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    hourly_rate: Optional[float] = None
    min_charge: Optional[float] = None
    experience_years: Optional[int] = 0


class ProviderUpdate(ProviderCreate):
    is_available: Optional[bool] = None
    is_verified: Optional[bool] = None


class ProviderOut(BaseModel):
    id: int
    user_id: int
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category_id: Optional[int] = None
    service_area: Optional[str] = None
    city: Optional[str] = None
    hourly_rate: Optional[float] = None
    min_charge: Optional[float] = None
    experience_years: int
    is_verified: bool
    is_available: bool
    average_rating: float
    total_reviews: int
    total_jobs: int
    created_at: datetime

    # Joined fields
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    primary_service: Optional[str] = None

    model_config = {"from_attributes": True}
