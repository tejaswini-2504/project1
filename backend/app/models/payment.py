from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from app.database.base import Base
import enum


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, enum.Enum):
    MOCK = "MOCK"
    CARD = "CARD"
    UPI = "UPI"
    NETBANKING = "NETBANKING"
    CASH = "CASH"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(SAEnum(PaymentMethod), default=PaymentMethod.MOCK)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING)

    # Payment details / Gateway reference
    transaction_id = Column(String(100), nullable=True)
    upi_id = Column(String(100), nullable=True)
    card_last4 = Column(String(10), nullable=True)
    card_network = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    gateway_response = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
