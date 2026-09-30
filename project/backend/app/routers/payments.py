from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentHistoryItem, PaymentReceiptOut
from app.services.payment_service import (
    process_payment,
    get_customer_payment_history,
    get_payment_receipt,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentOut, status_code=201)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return process_payment(db, data, current_user.id)


@router.get("/my-history", response_model=list[PaymentHistoryItem])
def list_my_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_customer_payment_history(db, current_user.id)


@router.get("/booking/{booking_id}", response_model=PaymentOut)
def get_payment_for_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = db.query(Payment).filter(Payment.booking_id == booking_id).order_by(Payment.created_at.desc()).first()
    if not p:
        raise HTTPException(status_code=404, detail="No payment found for this booking")
    return p


@router.get("/{payment_id}/receipt", response_model=PaymentReceiptOut)
def get_receipt(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return get_payment_receipt(db, payment_id, current_user.id, role_str)



@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    return p
