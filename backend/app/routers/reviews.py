from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.schemas.review import ReviewCreate, ReviewOut
from app.services.provider_service import update_provider_stats

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    existing = db.query(Review).filter(Review.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted")

    review = Review(
        booking_id=data.booking_id,
        customer_id=current_user.id,
        provider_id=booking.provider_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Update provider stats
    update_provider_stats(db, booking.provider_id)

    # Add customer_name for response
    result = ReviewOut.model_validate(review)
    result.customer_name = current_user.full_name
    return result
