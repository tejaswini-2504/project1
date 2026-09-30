import uuid
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.booking import Booking, BookingStatus
from app.models.invoice import Invoice
from app.models.user import User
from app.models.provider import Provider
from app.models.service import Service
from app.models.category import Category
from app.models.notification import Notification
from app.schemas.payment import PaymentCreate, PaymentReceiptOut


def process_payment(db: Session, data: PaymentCreate, user_id: int) -> Payment:
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this booking")
    if booking.is_paid:
        raise HTTPException(status_code=400, detail="Booking is already paid")

    # Prefix based on payment method
    method_str = (data.payment_method.value if hasattr(data.payment_method, "value") else str(data.payment_method)).upper()
    prefix_map = {
        "UPI": "TXN-UPI",
        "CARD": "TXN-CRD",
        "NETBANKING": "TXN-NBK",
        "CASH": "TXN-CSH",
        "MOCK": "TXN-MCK",
    }
    prefix = prefix_map.get(method_str, "TXN")
    txn_id = f"{prefix}-{uuid.uuid4().hex[:10].upper()}"

    # Calculate final amount
    final_amount = data.amount if data.amount and data.amount > 0 else (booking.total_amount or booking.estimated_amount or 0)
    discount = 0.0
    if data.discount_code:
        code = data.discount_code.strip().upper()
        if code in ["LOCALPRO50", "FIRST50", "WELCOME50"]:
            discount = min(50.0, final_amount * 0.5)
            final_amount = max(0.0, final_amount - discount)
        elif code in ["SAVE20", "LOCAL20"]:
            discount = round(final_amount * 0.2, 2)
            final_amount = max(0.0, final_amount - discount)

    # Format card or upi metadata
    card_last4 = data.card_last4
    if card_last4 and len(card_last4) > 4:
        card_last4 = card_last4[-4:]

    payment = Payment(
        booking_id=booking.id,
        customer_id=user_id,
        provider_id=booking.provider_id,
        amount=round(final_amount, 2),
        payment_method=data.payment_method,
        status=PaymentStatus.SUCCESS,
        transaction_id=txn_id,
        upi_id=data.upi_id,
        card_last4=card_last4,
        card_network=data.card_network,
        notes=f"Discount applied: ₹{discount}" if discount > 0 else data.notes,
    )
    db.add(payment)

    # Update booking status
    booking.is_paid = True
    booking.total_amount = round(final_amount, 2)

    # Generate or update invoice
    _generate_invoice(db, booking, payment, discount=discount)

    # In-app notifications
    customer = db.query(User).filter(User.id == user_id).first()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    svc = db.query(Service).filter(Service.id == booking.service_id).first() if booking.service_id else None
    svc_name = svc.name if svc else "Service"

    db.add(Notification(
        user_id=user_id,
        title="Payment Successful",
        message=f"Your payment of ₹{final_amount:.2f} for {svc_name} via {method_str} was successful (Txn: {txn_id}).",
        notification_type="success",
        related_booking_id=booking.id,
    ))

    if provider_user:
        db.add(Notification(
            user_id=provider_user.id,
            title="Payment Received",
            message=f"Received payment of ₹{final_amount:.2f} for {svc_name} from {customer.full_name if customer else 'Customer'}.",
            notification_type="success",
            related_booking_id=booking.id,
        ))

    db.commit()
    db.refresh(payment)
    return payment


def _generate_invoice(db: Session, booking: Booking, payment: Payment, discount: float = 0.0) -> Invoice:
    invoice_number = f"INV-{booking.id:06d}"
    existing = db.query(Invoice).filter(Invoice.booking_id == booking.id).first()
    if existing:
        existing.total_amount = payment.amount
        existing.discount = discount
        existing.is_paid = True
        return existing

    subtotal = payment.amount + discount
    invoice = Invoice(
        booking_id=booking.id,
        invoice_number=invoice_number,
        customer_id=booking.customer_id,
        provider_id=booking.provider_id,
        subtotal=round(subtotal, 2),
        tax_amount=0.0,
        discount=round(discount, 2),
        total_amount=round(payment.amount, 2),
        notes=f"Payment method: {payment.payment_method.value if hasattr(payment.payment_method, 'value') else payment.payment_method}",
        is_paid=True,
    )
    db.add(invoice)
    booking.invoice_generated = True
    return invoice


def get_customer_payment_history(db: Session, user_id: int) -> list[dict]:
    """Returns detailed payment history for the customer."""
    # Find all payments where customer_id == user_id or booking.customer_id == user_id
    payments = (
        db.query(Payment)
        .join(Booking, Booking.id == Payment.booking_id)
        .filter((Payment.customer_id == user_id) | (Booking.customer_id == user_id))
        .order_by(Payment.created_at.desc())
        .all()
    )

    result = []
    for p in payments:
        booking = db.query(Booking).filter(Booking.id == p.booking_id).first()
        invoice = db.query(Invoice).filter(Invoice.booking_id == p.booking_id).first()
        provider = db.query(Provider).filter(Provider.id == booking.provider_id).first() if booking else None
        p_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
        svc = db.query(Service).filter(Service.id == booking.service_id).first() if booking and booking.service_id else None
        customer = db.query(User).filter(User.id == user_id).first()

        method_val = p.payment_method.value if hasattr(p.payment_method, "value") else str(p.payment_method)
        status_val = p.status.value if hasattr(p.status, "value") else str(p.status)

        result.append({
            "id": p.id,
            "booking_id": p.booking_id,
            "amount": p.amount,
            "payment_method": method_val,
            "status": status_val,
            "transaction_id": p.transaction_id or f"TXN-{p.id:06d}",
            "upi_id": p.upi_id,
            "card_last4": p.card_last4,
            "card_network": p.card_network,
            "created_at": p.created_at,
            "invoice_number": invoice.invoice_number if invoice else f"INV-{p.booking_id:06d}",
            "service_name": svc.name if svc else "General Service",
            "provider_name": p_user.full_name if p_user else (provider.business_name if provider else "Service Provider"),
            "provider_business": provider.business_name if provider else None,
            "customer_name": customer.full_name if customer else "Customer",
            "customer_email": customer.email if customer else None,
            "scheduled_date": booking.scheduled_date.isoformat() if (booking and booking.scheduled_date) else None,
            "address": booking.address if booking else None,
        })
    return result


def get_payment_receipt(db: Session, payment_id: int, user_id: int, role: str) -> dict:
    """Returns comprehensive receipt details for viewing/printing."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Associated booking not found")

    # Authorization
    if role == "customer" and (payment.customer_id != user_id and booking.customer_id != user_id):
        raise HTTPException(status_code=403, detail="Not authorized to view this receipt")
    elif role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()
        if not provider or (payment.provider_id != provider.id and booking.provider_id != provider.id):
            raise HTTPException(status_code=403, detail="Not authorized to view this receipt")

    customer = db.query(User).filter(User.id == booking.customer_id).first()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    service = db.query(Service).filter(Service.id == booking.service_id).first() if booking.service_id else None
    category = db.query(Category).filter(Category.id == service.category_id).first() if (service and service.category_id) else None
    invoice = db.query(Invoice).filter(Invoice.booking_id == booking.id).first()

    method_val = payment.payment_method.value if hasattr(payment.payment_method, "value") else str(payment.payment_method)
    status_val = payment.status.value if hasattr(payment.status, "value") else str(payment.status)

    subtotal = invoice.subtotal if invoice and invoice.subtotal else payment.amount
    discount = invoice.discount if invoice and invoice.discount else 0.0
    tax = invoice.tax_amount if invoice and invoice.tax_amount else 0.0

    return {
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id or f"TXN-{payment.id:06d}",
        "invoice_number": invoice.invoice_number if invoice else f"INV-{booking.id:06d}",
        "booking_id": booking.id,
        "created_at": payment.created_at,
        "status": status_val,
        "payment_method": method_val,
        "upi_id": payment.upi_id,
        "card_last4": payment.card_last4,
        "card_network": payment.card_network,
        "subtotal": round(subtotal, 2),
        "tax_amount": round(tax, 2),
        "discount_amount": round(discount, 2),
        "total_amount": round(payment.amount, 2),
        "customer_name": customer.full_name if customer else "Customer",
        "customer_email": customer.email if customer else "N/A",
        "customer_phone": customer.phone if customer else "N/A",
        "provider_name": provider_user.full_name if provider_user else "Service Provider",
        "provider_business": provider.business_name if provider else "LocalPro Partner",
        "provider_phone": provider_user.phone if provider_user else "N/A",
        "service_name": service.name if service else "General Service",
        "service_category": category.name if category else "Home Services",
        "scheduled_date": booking.scheduled_date.isoformat() if booking.scheduled_date else None,
        "scheduled_time": booking.scheduled_time or "N/A",
        "address": booking.address or "Customer Location",
    }


def get_all_admin_payments(db: Session, search: str = None, status: str = None, method: str = None, limit: int = 200) -> list[dict]:
    """Returns enriched payments for admin dashboard."""
    query = db.query(Payment).order_by(Payment.created_at.desc())

    if status and status.upper() != "ALL":
        query = query.filter(Payment.status == status.upper())
    if method and method.upper() != "ALL":
        query = query.filter(Payment.payment_method == method.upper())

    payments = query.limit(limit).all()
    result = []
    for p in payments:
        booking = db.query(Booking).filter(Booking.id == p.booking_id).first()
        customer = db.query(User).filter(User.id == (p.customer_id or (booking.customer_id if booking else None))).first()
        provider = db.query(Provider).filter(Provider.id == (p.provider_id or (booking.provider_id if booking else None))).first()
        p_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
        svc = db.query(Service).filter(Service.id == booking.service_id).first() if booking and booking.service_id else None
        inv = db.query(Invoice).filter(Invoice.booking_id == p.booking_id).first()

        item = {
            "id": p.id,
            "booking_id": p.booking_id,
            "amount": p.amount,
            "payment_method": p.payment_method.value if hasattr(p.payment_method, "value") else str(p.payment_method),
            "status": p.status.value if hasattr(p.status, "value") else str(p.status),
            "transaction_id": p.transaction_id or f"TXN-{p.id:06d}",
            "upi_id": p.upi_id,
            "card_last4": p.card_last4,
            "card_network": p.card_network,
            "created_at": p.created_at,
            "invoice_number": inv.invoice_number if inv else f"INV-{p.booking_id:06d}",
            "customer_name": customer.full_name if customer else "Unknown Customer",
            "customer_email": customer.email if customer else "N/A",
            "provider_name": p_user.full_name if p_user else (provider.business_name if provider else "Unknown Provider"),
            "provider_business": provider.business_name if provider else None,
            "service_name": svc.name if svc else "Service",
        }

        # Apply text search across transaction_id, customer_name, provider_name, invoice_number
        if search:
            s = search.lower()
            match = (
                (item["transaction_id"] and s in item["transaction_id"].lower()) or
                (item["customer_name"] and s in item["customer_name"].lower()) or
                (item["customer_email"] and s in item["customer_email"].lower()) or
                (item["provider_name"] and s in item["provider_name"].lower()) or
                (item["provider_business"] and s in item["provider_business"].lower()) or
                (item["invoice_number"] and s in item["invoice_number"].lower()) or
                (str(item["booking_id"]) == s)
            )
            if not match:
                continue

        result.append(item)
    return result


def get_admin_payment_stats(db: Session) -> dict:
    """Computes aggregated payment analytics for admin dashboard."""
    payments = db.query(Payment).all()
    total_revenue = sum(p.amount for p in payments if p.status == PaymentStatus.SUCCESS)
    total_count = len(payments)
    success_count = sum(1 for p in payments if p.status == PaymentStatus.SUCCESS)
    failed_count = sum(1 for p in payments if p.status == PaymentStatus.FAILED)
    pending_count = sum(1 for p in payments if p.status == PaymentStatus.PENDING)

    # Payment method breakdown
    method_breakdown = {
        "UPI": 0,
        "CARD": 0,
        "NETBANKING": 0,
        "CASH": 0,
        "MOCK": 0,
    }
    method_revenue = {
        "UPI": 0.0,
        "CARD": 0.0,
        "NETBANKING": 0.0,
        "CASH": 0.0,
        "MOCK": 0.0,
    }

    for p in payments:
        m = (p.payment_method.value if hasattr(p.payment_method, "value") else str(p.payment_method)).upper()
        if m in method_breakdown:
            method_breakdown[m] += 1
            if p.status == PaymentStatus.SUCCESS:
                method_revenue[m] += p.amount

    # Today's collection
    now = datetime.now(timezone.utc)
    today_revenue = sum(
        p.amount for p in payments
        if p.status == PaymentStatus.SUCCESS and p.created_at and p.created_at.date() == now.date()
    )

    avg_order_value = round(total_revenue / success_count, 2) if success_count > 0 else 0.0

    return {
        "total_revenue": round(total_revenue, 2),
        "today_revenue": round(today_revenue, 2),
        "total_transactions": total_count,
        "successful_transactions": success_count,
        "failed_transactions": failed_count,
        "pending_transactions": pending_count,
        "success_rate": round((success_count / total_count * 100), 1) if total_count > 0 else 100.0,
        "average_order_value": avg_order_value,
        "method_breakdown": method_breakdown,
        "method_revenue": {k: round(v, 2) for k, v in method_revenue.items()},
    }


def get_payments_for_provider(db: Session, provider_id: int) -> dict:
    """Returns earnings and paid booking history for provider."""
    bookings = db.query(Booking).filter(
        Booking.provider_id == provider_id,
        Booking.is_paid == True,
    ).all()

    now = datetime.now(timezone.utc)
    total = sum(b.total_amount or 0 for b in bookings)
    this_month = sum(
        b.total_amount or 0 for b in bookings
        if b.updated_at and b.updated_at.month == now.month and b.updated_at.year == now.year
    )

    booking_list = []
    for b in bookings:
        svc = db.query(Service).filter(Service.id == b.service_id).first()
        customer = db.query(User).filter(User.id == b.customer_id).first()
        payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
        method_str = (payment.payment_method.value if payment and hasattr(payment.payment_method, "value") else (str(payment.payment_method) if payment else "UPI"))

        booking_list.append({
            "booking_id": b.id,
            "payment_id": payment.id if payment else None,
            "transaction_id": payment.transaction_id if payment else f"TXN-{b.id:06d}",
            "service_name": svc.name if svc else "Service",
            "customer_name": customer.full_name if customer else "Customer",
            "payment_method": method_str,
            "date": b.updated_at.strftime("%d %b %Y") if b.updated_at else "",
            "amount": b.total_amount or 0,
            "status": b.status.value if hasattr(b.status, "value") else str(b.status),
        })

    return {
        "total": round(total, 2),
        "this_month": round(this_month, 2),
        "bookings": booking_list,
    }
