from typing import Optional
from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class ServiceOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None
    base_price: Optional[float] = None
    price_unit: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}
