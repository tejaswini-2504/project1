from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.category import Category
from app.models.service import Service
from app.schemas.service import CategoryOut, ServiceOut

router = APIRouter(tags=["Services & Categories"])


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True)\
        .order_by(Category.sort_order, Category.name).all()


@router.get("/services", response_model=list[ServiceOut])
def get_services(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Service).filter(Service.is_active == True)
    if category_id:
        q = q.filter(Service.category_id == category_id)

    services = q.order_by(Service.name).all()
    result = []
    for s in services:
        cat = db.query(Category).filter(Category.id == s.category_id).first()
        d = ServiceOut.model_validate(s)
        d.category_name = cat.name if cat else None
        result.append(d)
    return result
