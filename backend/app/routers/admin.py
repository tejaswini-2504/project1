from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.models.provider import Provider
from app.models.booking import Booking
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total_users = db.query(User).count()
    total_providers = db.query(Provider).count()
    total_bookings = db.query(Booking).count()
    total_revenue = db.query(Payment).filter(Payment.status == PaymentStatus.SUCCESS)\
        .with_entities(Payment.amount).all()
    revenue = sum(r[0] for r in total_revenue)
    return {
        "total_users": total_users,
        "total_providers": total_providers,
        "total_bookings": total_bookings,
        "total_revenue": round(revenue, 2),
    }


@router.get("/users", response_model=list[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/providers")
def list_all_providers(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    providers = db.query(Provider).all()
    result = []
    for p in providers:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_name": user.full_name if user else None,
            "business_name": p.business_name,
            "service_area": p.service_area,
            "is_verified": p.is_verified,
            "is_active": p.is_active,
            "average_rating": p.average_rating,
            "total_reviews": p.total_reviews,
            "total_jobs": p.total_jobs,
        })
    return result


@router.put("/providers/{provider_id}")
def update_provider_admin(
    provider_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    allowed = {"is_verified", "is_active", "is_available"}
    for key, value in data.items():
        if key in allowed:
            setattr(p, key, value)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "is_verified": p.is_verified, "is_active": p.is_active}


@router.get("/bookings")
def list_all_bookings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(200).all()
    result = []
    for b in bookings:
        customer = db.query(User).filter(User.id == b.customer_id).first()
        provider = db.query(Provider).filter(Provider.id == b.provider_id).first()
        puser = db.query(User).filter(User.id == provider.user_id).first() if provider else None
        svc = db.query(Service).filter(Service.id == b.service_id).first() if b.service_id else None
        result.append({
            "id": b.id,
            "customer_name": customer.full_name if customer else None,
            "provider_name": (provider.business_name or puser.full_name) if puser else None,
            "service_name": svc.name if svc else None,
            "status": b.status,
            "scheduled_date": b.scheduled_date,
            "total_amount": b.total_amount,
        })
    return result


@router.get("/payments")
def list_all_payments(
    search: str = None,
    status: str = None,
    method: str = None,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from app.services.payment_service import get_all_admin_payments
    return get_all_admin_payments(db, search=search, status=status, method=method, limit=limit)


@router.get("/payments/stats")
def get_payment_statistics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from app.services.payment_service import get_admin_payment_stats
    return get_admin_payment_stats(db)


@router.get("/payments/{payment_id}/receipt")
def get_admin_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from app.services.payment_service import get_payment_receipt
    return get_payment_receipt(db, payment_id, user_id=admin.id, role="admin")



@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from app.models.booking import BookingStatus
    from sqlalchemy import func

    total_b = db.query(Booking).count()
    completed_b = db.query(Booking).filter(Booking.status == BookingStatus.COMPLETED).count()
    cancelled_b = db.query(Booking).filter(Booking.status == BookingStatus.CANCELLED).count()
    active_b = total_b - completed_b - cancelled_b

    # Top services
    top_svcs = (
        db.query(Service.name, func.count(Booking.id).label("cnt"))
        .join(Booking, Booking.service_id == Service.id)
        .group_by(Service.name)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )

    return {
        "booking_stats": {
            "total": total_b,
            "completed": completed_b,
            "cancelled": cancelled_b,
            "active": active_b,
        },
        "top_services": [{"name": name, "count": cnt} for name, cnt in top_svcs],
    }
