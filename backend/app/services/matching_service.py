"""
Provider matching/ranking service.
MVP uses: service match → rating → availability → price.
Architecture allows adding ML-based ranking later.
"""
from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.models.service import Service, ProviderService
from app.models.category import Category


def rank_providers(db: Session, service_name: str, category_name: str = "") -> list[dict]:
    """Return providers ranked for a given service name."""
    from app.services.provider_service import _enrich, get_providers

    # Find the service
    service = db.query(Service).filter(Service.name.ilike(f"%{service_name}%")).first()
    if service:
        # Find providers offering this service via ProviderService
        ps_ids = [ps.provider_id for ps in
                  db.query(ProviderService).filter(ProviderService.service_id == service.id).all()]
        # Also match by category
        cat = db.query(Category).filter(Category.id == service.category_id).first()
        cat_providers = db.query(Provider).filter(
            Provider.category_id == service.category_id,
            Provider.is_active == True
        ).all()
        all_providers = {p.id: p for p in cat_providers}
    else:
        # Fallback – search by category name
        cat = db.query(Category).filter(Category.name.ilike(f"%{category_name}%")).first()
        if cat:
            cat_providers = db.query(Provider).filter(
                Provider.category_id == cat.id, Provider.is_active == True
            ).all()
        else:
            cat_providers = db.query(Provider).filter(Provider.is_active == True).limit(20).all()
        all_providers = {p.id: p for p in cat_providers}

    # Score each provider
    scored = []
    for p in all_providers.values():
        score = p.average_rating * 20  # 0–100 based on 5-star rating
        if p.is_verified:
            score += 15
        if p.is_available:
            score += 10
        scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    from app.services.provider_service import _enrich
    return [_enrich(p, db) for _, p in scored[:20]]
