from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Float, DateTime
from app.database.base import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=True)
    tagline = Column(String(250), nullable=True)
    bio = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # Location / service area
    service_area = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Pricing
    hourly_rate = Column(Float, nullable=True)
    min_charge = Column(Float, nullable=True)

    # Profile
    experience_years = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    # Stats (denormalized for performance)
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    total_jobs = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
