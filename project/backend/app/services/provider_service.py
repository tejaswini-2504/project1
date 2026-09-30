from typing import Optional
from sqlalchemy.orm import Session

from app.models.provider import Provider
from app.models.user import User
from app.models.category import Category
from app.models.service import Service
from app.schemas.provider import ProviderCreate, ProviderUpdate


def _enrich(provider: Provider, db: Session) -> dict:
    """Add joined user/category fields to provider dict."""
    user = db.query(User).filter(User.id == provider.user_id).first()
    d = {c.name: getattr(provider, c.name) for c in provider.__table__.columns}
    d["user_name"] = user.full_name if user else None
    d["user_email"] = user.email if user else None
    d["user_phone"] = user.phone if user else None
    d["user_avatar"] = user.avatar_url if user else None

    # Attach services this provider offers
    services = []
    from app.models.service import ProviderService, Service
    psvs = db.query(ProviderService).filter(ProviderService.provider_id == provider.id, ProviderService.is_active == True).all()
    for pv in psvs:
        svc = db.query(Service).filter(Service.id == pv.service_id).first()
        if svc:
            services.append({
                "id": svc.id,
                "name": svc.name,
                "base_price": svc.base_price,
                "custom_price": pv.custom_price,
                "price_unit": pv.price_unit or svc.price_unit,
            })
    d["services"] = services
    d["primary_service"] = services[0]["name"] if services else None
    return d


def get_providers(
    db: Session,
    category: Optional[int] = None,
    search: Optional[str] = None,
    service_name: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    q = db.query(Provider).filter(Provider.is_active == True)
    if category:
        q = q.filter(Provider.category_id == int(category))
    if search:
        q = q.join(User, User.id == Provider.user_id).filter(
            (User.full_name.ilike(f"%{search}%")) | (Provider.business_name.ilike(f"%{search}%"))
        )
    providers = q.order_by(Provider.average_rating.desc()).limit(limit).all()
    return [_enrich(p, db) for p in providers]


def get_provider_by_id(db: Session, provider_id: int) -> Optional[dict]:
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        return None
    return _enrich(p, db)


def get_provider_by_user_id(db: Session, user_id: int) -> Optional[Provider]:
    return db.query(Provider).filter(Provider.user_id == user_id).first()


def create_or_update_provider(db: Session, user_id: int, data: ProviderCreate) -> Provider:
    p = db.query(Provider).filter(Provider.user_id == user_id).first()
    if p:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(p, k, v)
    else:
        p = Provider(user_id=user_id, **data.model_dump(exclude_unset=True))
        db.add(p)
    # Ensure the user's role is set to provider
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        from app.models.user import UserRole
        if user.role != UserRole.provider:
            user.role = UserRole.provider
            db.add(user)

    db.commit()
    db.refresh(p)
    return p


def update_provider_stats(db: Session, provider_id: int) -> None:
    """Recalculate average rating and total reviews from reviews table."""
    from app.models.review import Review
    reviews = db.query(Review).filter(Review.provider_id == provider_id, Review.is_visible == True).all()
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if p and reviews:
        p.total_reviews = len(reviews)
        p.average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
        db.commit()
