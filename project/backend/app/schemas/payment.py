from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel
from app.models.payment import PaymentStatus, PaymentMethod


class PaymentCreate(BaseModel):
    booking_id: int
    amount: float
    payment_method: PaymentMethod = PaymentMethod.MOCK
    upi_id: Optional[str] = None
    upi_app: Optional[str] = None
    card_last4: Optional[str] = None
    card_network: Optional[str] = None
    cardholder_name: Optional[str] = None
    discount_code: Optional[str] = None
    notes: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    customer_id: Optional[int] = None
    provider_id: Optional[int] = None
    amount: float
    payment_method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str] = None
    upi_id: Optional[str] = None
    card_last4: Optional[str] = None
    card_network: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaymentHistoryItem(BaseModel):
    id: int
    booking_id: int
    amount: float
    payment_method: str
    status: str
    transaction_id: Optional[str] = None
    upi_id: Optional[str] = None
    card_last4: Optional[str] = None
    card_network: Optional[str] = None
    created_at: datetime
    invoice_number: Optional[str] = None
    service_name: Optional[str] = None
    provider_name: Optional[str] = None
    provider_business: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    scheduled_date: Optional[str] = None
    address: Optional[str] = None


class PaymentReceiptOut(BaseModel):
    payment_id: int
    transaction_id: Optional[str] = None
    invoice_number: Optional[str] = None
    booking_id: int
    created_at: datetime
    status: str
    payment_method: str
    upi_id: Optional[str] = None
    card_last4: Optional[str] = None
    card_network: Optional[str] = None

    # Amount breakdown
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float

    # Customer & Provider info
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    provider_name: str
    provider_business: Optional[str] = None
    provider_phone: Optional[str] = None

    # Service & Booking info
    service_name: str
    service_category: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    address: Optional[str] = None

