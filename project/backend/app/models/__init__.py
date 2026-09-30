# Import all models here so SQLAlchemy can discover them via Base.metadata
from app.models.user import User
from app.models.category import Category
from app.models.service import Service, ProviderService
from app.models.provider import Provider
from app.models.address import Address
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review
from app.models.invoice import Invoice
from app.models.notification import Notification
from app.models.availability import Availability
from app.models.complaint import Complaint
from app.models.ai_request import AIRequest
from app.models.message import Message
