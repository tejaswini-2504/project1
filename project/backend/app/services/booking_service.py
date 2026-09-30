from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.models.provider import Provider
from app.models.user import User
from app.models.service import Service
from app.schemas.booking import BookingCreate, BookingStatusUpdate


def _enrich_booking(b: Booking, db: Session) -> dict:
    customer = db.query(User).filter(User.id == b.customer_id).first()
    provider = db.query(Provider).filter(Provider.id == b.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    service = db.query(Service).filter(Service.id == b.service_id).first() if b.service_id else None

    d = {c.name: getattr(b, c.name) for c in b.__table__.columns}
    d["customer_name"] = customer.full_name if customer else None
    d["provider_name"] = (provider.business_name or provider_user.full_name) if provider_user else None
    d["service_name"] = service.name if service else None
    return d


def create_booking(db: Session, customer_id: int, data: BookingCreate) -> dict:
    provider = db.query(Provider).filter(Provider.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    booking = Booking(
        customer_id=customer_id,
        provider_id=data.provider_id,
        service_id=data.service_id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        address=data.address,
        customer_notes=data.notes,
        estimated_amount=data.estimated_amount,
        total_amount=data.estimated_amount,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _enrich_booking(booking, db)


def get_bookings_for_user(db: Session, user_id: int, role: str, limit: int = 100) -> list[dict]:
    if role == "customer":
        bookings = db.query(Booking).filter(Booking.customer_id == user_id)\
            .order_by(Booking.created_at.desc()).limit(limit).all()
    elif role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()
        if not provider:
            return []
        bookings = db.query(Booking).filter(Booking.provider_id == provider.id)\
            .order_by(Booking.created_at.desc()).limit(limit).all()
    else:
        bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(limit).all()
    return [_enrich_booking(b, db) for b in bookings]


def get_booking_by_id(db: Session, booking_id: int, user_id: int, role: str) -> dict:
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if role == "customer" and b.customer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()
        if not provider or b.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    return _enrich_booking(b, db)


def update_booking_status(db: Session, booking_id: int, user_id: int, role: str, data: BookingStatusUpdate) -> dict:
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorisation check
    if role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()
        if not provider or b.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif role == "customer":
        if b.customer_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        # Customers can only cancel
        if data.status != BookingStatus.CANCELLED:
            raise HTTPException(status_code=403, detail="Customers can only cancel bookings")

    b.status = data.status
    if data.note:
        if role == "provider":
            b.provider_notes = data.note
        else:
            b.cancellation_reason = data.note
    if data.status == BookingStatus.COMPLETED:
        b.total_amount = b.estimated_amount or b.total_amount
        # Update provider job count
        provider = db.query(Provider).filter(Provider.id == b.provider_id).first()
        if provider:
            provider.total_jobs = (provider.total_jobs or 0) + 1
    db.commit()
    db.refresh(b)
    return _enrich_booking(b, db)
