from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Time
from app.database.base import Base


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)   # 0=Mon … 6=Sun
    start_time = Column(String(5), default="09:00") # HH:MM
    end_time = Column(String(5), default="18:00")
    is_available = Column(Boolean, default=True)
