from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Float
from app.database.base import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    base_price = Column(Float, nullable=True)
    price_unit = Column(String(30), default="per visit")   # per hour, per visit, etc.
    keywords = Column(Text, nullable=True)                  # comma-separated for AI matching


class ProviderService(Base):
    """Links a provider to the specific services they offer."""
    __tablename__ = "provider_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    custom_price = Column(Float, nullable=True)
    price_unit = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
