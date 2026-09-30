from sqlalchemy import Column, Integer, String, Boolean, Text
from app.database.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(10), nullable=True)      # emoji icon
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
