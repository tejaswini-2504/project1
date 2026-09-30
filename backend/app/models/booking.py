from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Float, DateTime, Date, Time, Enum as SAEnum
from app.database.base import Base
import enum


class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    ON_THE_WAY = "ON_THE_WAY"
    ARRIVED = "ARRIVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)

    status = Column(SAEnum(BookingStatus), default=BookingStatus.REQUESTED, nullable=False)

    # Schedule
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(String(10), nullable=True)    # HH:MM

    # Location
    address = Column(Text, nullable=True)

    # Pricing
    estimated_amount = Column(Float, nullable=True)
    total_amount = Column(Float, nullable=True)

    # Notes
    customer_notes = Column(Text, nullable=True)
    provider_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Flags
    is_paid = Column(Boolean, default=False)
    invoice_generated = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
