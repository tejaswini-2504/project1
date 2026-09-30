"""
LocalPro Database Seed Script
===============================
Run from the project root:
    cd backend
    python ../database/seed.py

This script:
- Creates all tables
- Seeds: admin, customers, providers
- Seeds: all service categories and services
- Seeds: provider services, sample bookings, payments, reviews
"""

import sys
import os
from pathlib import Path

# Make sure we can import the backend app
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database.connection import engine, SessionLocal
from app.database.base import Base

# Import all models to register them
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.service import Service, ProviderService
from app.models.provider import Provider
from app.models.address import Address
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.review import Review
from app.models.invoice import Invoice
from app.models.availability import Availability
from app.models.notification import Notification

from app.core.security import hash_password
from datetime import date, datetime, timezone


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding users...")
        # ── Admin ──────────────────────────────────────────────────────────
        admin = User(
            full_name="Admin User",
            email="admin@localpro.com",
            phone="+91 98000 00001",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
            is_active=True,
            is_verified=True,
        )

        # ── Customers ──────────────────────────────────────────────────────
        customers = [
            User(full_name="Priya Sharma",   email="customer1@demo.com", phone="+91 98111 11111",
                 hashed_password=hash_password("customer123"), role=UserRole.customer, is_active=True),
            User(full_name="Rahul Gupta",    email="customer2@demo.com", phone="+91 98222 22222",
                 hashed_password=hash_password("customer123"), role=UserRole.customer, is_active=True),
            User(full_name="Anita Mehta",    email="customer3@demo.com", phone="+91 98333 33333",
                 hashed_password=hash_password("customer123"), role=UserRole.customer, is_active=True),
        ]

        # ── Provider Users ─────────────────────────────────────────────────
        provider_users = [
            User(full_name="Ramesh Kumar",   email="provider1@demo.com", phone="+91 98444 44444",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
            User(full_name="Suresh Patel",   email="provider2@demo.com", phone="+91 98555 55555",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
            User(full_name="Meena Devi",     email="provider3@demo.com", phone="+91 98666 66666",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
            User(full_name="Vikram Singh",   email="provider4@demo.com", phone="+91 98777 77777",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
            User(full_name="Deepa Nair",     email="provider5@demo.com", phone="+91 98888 88888",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
            User(full_name="Ajay Yadav",     email="provider6@demo.com", phone="+91 98999 99999",
                 hashed_password=hash_password("provider123"), role=UserRole.provider, is_active=True),
        ]

        db.add(admin)
        db.add_all(customers)
        db.add_all(provider_users)
        db.commit()

        print("Seeding categories and services...")
        # ── Categories ─────────────────────────────────────────────────────
        cat_data = [
            ("Home Repair",    "🔧", "Electrical, plumbing, carpentry and more"),
            ("Home Care",      "🏠", "Cleaning and home maintenance services"),
            ("Care",           "👶", "Nanny, babysitter and elderly care"),
            ("Food",           "🍳", "Home cooks, tiffin and catering"),
            ("Personal Care",  "💇", "Beauty, grooming and personal services"),
            ("Vehicle",        "🚗", "Car, bike and vehicle services"),
            ("Tech Repair",    "💻", "Mobile, laptop and gadget repair"),
            ("Appliance",      "🔌", "AC, fridge and appliance repair"),
            ("Small Business", "🏪", "Tailor, laundry, florist and more"),
            ("Learning",       "📚", "Tutors, trainers and skill teachers"),
        ]
        categories = {}
        for i, (name, icon, desc) in enumerate(cat_data):
            cat = Category(name=name, icon=icon, description=desc, is_active=True, sort_order=i)
            db.add(cat)
            categories[name] = cat
        db.commit()

        # ── Services ───────────────────────────────────────────────────────
        service_data = [
            # category,          name,                     base_price, unit,       keywords
            ("Home Repair",  "Electrician",              400,  "per visit", "electric wiring fuse switch socket"),
            ("Home Repair",  "Plumber",                  350,  "per visit", "leak pipe drain tap water"),
            ("Home Repair",  "Carpenter",                500,  "per visit", "wood door furniture cabinet"),
            ("Home Repair",  "Painter",                  600,  "per day",   "paint wall colour whitewash"),
            ("Home Repair",  "Mason",                    550,  "per day",   "cement tile wall crack repair"),
            ("Home Care",    "Cleaner",                  400,  "per visit", "clean sweep mop dust"),
            ("Home Care",    "Deep Cleaning",           1200,  "per visit", "deep clean thorough"),
            ("Home Care",    "Sofa Cleaning",            600,  "per sofa",  "sofa couch upholstery"),
            ("Home Care",    "Bathroom Cleaning",        350,  "per visit", "bathroom toilet tiles"),
            ("Care",         "Nanny",                    600,  "per day",   "nanny child care infant"),
            ("Care",         "Babysitter",               400,  "per visit", "babysit child toddler"),
            ("Care",         "Elderly Care",             700,  "per day",   "elderly old senior care"),
            ("Food",         "Home Cook",                500,  "per visit", "cook meal food home"),
            ("Food",         "Tiffin",                  2500,  "per month", "tiffin lunch dinner daily"),
            ("Food",         "Catering",               8000,  "per event",  "cater party food event"),
            ("Food",         "Home Baker",              300,  "per order",  "cake bake pastry sweet"),
            ("Personal Care","Beautician",               400,  "per visit", "beauty facial wax manicure"),
            ("Personal Care","Barber",                   150,  "per visit", "haircut shave hair"),
            ("Personal Care","Makeup",                  1500,  "per event", "makeup bridal party"),
            ("Personal Care","Mehendi",                  500,  "per event", "mehendi henna bridal"),
            ("Vehicle",      "Mechanic",                 600,  "per visit", "car repair engine service"),
            ("Vehicle",      "Car Wash",                 300,  "per wash",  "car wash clean vehicle"),
            ("Vehicle",      "Bike Repair",              400,  "per visit", "bike repair two wheeler"),
            ("Tech Repair",  "Mobile Repair",            400,  "per visit", "mobile phone screen crack"),
            ("Tech Repair",  "Laptop Repair",            700,  "per visit", "laptop screen keyboard"),
            ("Tech Repair",  "Printer Repair",           500,  "per visit", "printer scanner"),
            ("Tech Repair",  "Wi-Fi Repair",             350,  "per visit", "wifi router internet"),
            ("Appliance",    "AC Repair",                700,  "per visit", "ac air conditioner cooling"),
            ("Appliance",    "Refrigerator Repair",      650,  "per visit", "fridge refrigerator cool"),
            ("Appliance",    "Washing Machine Repair",   600,  "per visit", "washing machine washer"),
            ("Appliance",    "TV Repair",                500,  "per visit", "tv television screen"),
            ("Small Business","Tailor",                  300,  "per piece", "stitch dress alter"),
            ("Small Business","Laundry",                 400,  "per kg",    "laundry dry clean iron"),
            ("Small Business","Florist",                 500,  "per order", "flower bouquet floral"),
            ("Small Business","Photographer",           3000,  "per event", "photo photography"),
            ("Small Business","Gift Services",           400,  "per order", "gift hamper wrapping"),
            ("Learning",     "Tutor",                    500,  "per hour",  "tutor teach subject school"),
            ("Learning",     "Music Teacher",            600,  "per hour",  "music guitar piano singing"),
            ("Learning",     "Fitness Trainer",          700,  "per hour",  "fitness gym yoga exercise"),
            ("Learning",     "Event Services",          5000,  "per event", "event plan wedding party"),
        ]
        services = {}
        for cat_name, svc_name, price, unit, kw in service_data:
            svc = Service(
                name=svc_name,
                category_id=categories[cat_name].id,
                base_price=price,
                price_unit=unit,
                keywords=kw,
                is_active=True,
            )
            db.add(svc)
            services[svc_name] = svc
        db.commit()

        print("Seeding provider profiles...")
        # ── Provider Profiles ──────────────────────────────────────────────
        provider_profiles = [
            dict(
                user=provider_users[0],
                business_name="Ramesh Electric Works",
                tagline="Licensed electrician – 12 years of excellence",
                bio="Expert in all electrical work including wiring, fuse, switches and ceiling fans. Fast response guaranteed.",
                category="Home Repair",
                service="Electrician",
                area="Andheri West, Mumbai",
                city="Mumbai",
                rate=450, min_charge=300,
                exp=12, verified=True, rating=4.8, reviews=47,
            ),
            dict(
                user=provider_users[1],
                business_name="Suresh Plumbing Solutions",
                tagline="Your trusted plumber – available 24/7",
                bio="Specialized in leak repairs, pipe fitting, bathroom renovation and drain clearing.",
                category="Home Repair",
                service="Plumber",
                area="Bandra, Mumbai",
                city="Mumbai",
                rate=380, min_charge=250,
                exp=8, verified=True, rating=4.6, reviews=32,
            ),
            dict(
                user=provider_users[2],
                business_name="Meena's Home Care",
                tagline="Professional cleaning – spotless every time",
                bio="Thorough home cleaning, deep cleaning, sofa cleaning. Trained and background-verified staff.",
                category="Home Care",
                service="Cleaner",
                area="Powai, Mumbai",
                city="Mumbai",
                rate=400, min_charge=300,
                exp=5, verified=True, rating=4.9, reviews=89,
            ),
            dict(
                user=provider_users[3],
                business_name="Vikram AC & Appliance Repair",
                tagline="All appliance repairs – same day service",
                bio="AC installation, servicing and repair. Also handles fridge, washing machine and TV repairs.",
                category="Appliance",
                service="AC Repair",
                area="Goregaon, Mumbai",
                city="Mumbai",
                rate=700, min_charge=500,
                exp=10, verified=True, rating=4.7, reviews=61,
            ),
            dict(
                user=provider_users[4],
                business_name="Deepa Beauty Studio",
                tagline="Home beauty services – look stunning, stay relaxed",
                bio="Experienced beautician offering all services at your home: facial, waxing, threading, bridal makeup.",
                category="Personal Care",
                service="Beautician",
                area="Juhu, Mumbai",
                city="Mumbai",
                rate=450, min_charge=350,
                exp=7, verified=True, rating=4.8, reviews=54,
            ),
            dict(
                user=provider_users[5],
                business_name="Ajay Mobile & Laptop Care",
                tagline="Fast gadget repair – doorstep service",
                bio="Screen replacement, battery change, software issues – all devices repaired at your doorstep.",
                category="Tech Repair",
                service="Mobile Repair",
                area="Malad, Mumbai",
                city="Mumbai",
                rate=400, min_charge=200,
                exp=6, verified=False, rating=4.4, reviews=28,
            ),
        ]

        providers_db = []
        for pp in provider_profiles:
            cat = categories[pp["category"]]
            p = Provider(
                user_id=pp["user"].id,
                business_name=pp["business_name"],
                tagline=pp["tagline"],
                bio=pp["bio"],
                category_id=cat.id,
                service_area=pp["area"],
                city=pp["city"],
                hourly_rate=pp["rate"],
                min_charge=pp["min_charge"],
                experience_years=pp["exp"],
                is_verified=pp["verified"],
                is_available=True,
                is_active=True,
                average_rating=pp["rating"],
                total_reviews=pp["reviews"],
                total_jobs=pp["reviews"],
            )
            db.add(p)
            providers_db.append((p, pp["service"]))
        db.commit()

        # ── ProviderServices ───────────────────────────────────────────────
        for p, svc_name in providers_db:
            svc = services.get(svc_name)
            if svc:
                ps = ProviderService(provider_id=p.id, service_id=svc.id, custom_price=p.hourly_rate, is_active=True)
                db.add(ps)
        db.commit()

        # ── Availability (Mon–Fri 9am–6pm for all providers) ──────────────
        for p, _ in providers_db:
            for day in range(5):  # Monday to Friday
                db.add(Availability(provider_id=p.id, day_of_week=day, start_time="09:00", end_time="18:00", is_available=True))
        db.commit()

        print("Seeding bookings, payments and reviews...")
        # ── Sample Bookings ────────────────────────────────────────────────
        p0, _ = providers_db[0]  # Electrician
        p1, _ = providers_db[1]  # Plumber
        p2, _ = providers_db[2]  # Cleaner

        elec_svc  = services["Electrician"]
        plumb_svc = services["Plumber"]
        clean_svc = services["Cleaner"]

        # Completed booking: customer1 → Electrician
        b1 = Booking(
            customer_id=customers[0].id,
            provider_id=p0.id,
            service_id=elec_svc.id,
            status=BookingStatus.COMPLETED,
            scheduled_date=date(2026, 7, 15),
            scheduled_time="10:00",
            address="Flat 302, Sunrise Apts, Andheri West, Mumbai",
            estimated_amount=450,
            total_amount=450,
            is_paid=True,
            invoice_generated=True,
        )
        # Completed booking: customer1 → Plumber
        b2 = Booking(
            customer_id=customers[0].id,
            provider_id=p1.id,
            service_id=plumb_svc.id,
            status=BookingStatus.COMPLETED,
            scheduled_date=date(2026, 7, 20),
            scheduled_time="11:00",
            address="Flat 302, Sunrise Apts, Andheri West, Mumbai",
            estimated_amount=380,
            total_amount=380,
            is_paid=True,
            invoice_generated=True,
        )
        # Active booking: customer2 → Cleaner
        b3 = Booking(
            customer_id=customers[1].id,
            provider_id=p2.id,
            service_id=clean_svc.id,
            status=BookingStatus.ACCEPTED,
            scheduled_date=date(2026, 8, 12),
            scheduled_time="09:00",
            address="House 14, Powai, Mumbai",
            estimated_amount=400,
            total_amount=400,
            is_paid=False,
        )
        # Requested booking: customer3 → AC Repair
        p3, _ = providers_db[3]
        ac_svc = services["AC Repair"]
        b4 = Booking(
            customer_id=customers[2].id,
            provider_id=p3.id,
            service_id=ac_svc.id,
            status=BookingStatus.REQUESTED,
            scheduled_date=date(2026, 8, 13),
            scheduled_time="14:00",
            address="Sector 7, Goregaon East, Mumbai",
            estimated_amount=700,
            total_amount=700,
            is_paid=False,
        )
        db.add_all([b1, b2, b3, b4])
        db.commit()

        # ── Payments ───────────────────────────────────────────────────────
        pay1 = Payment(
            booking_id=b1.id,
            customer_id=customers[0].id,
            provider_id=p0.id,
            amount=450,
            payment_method=PaymentMethod.UPI,
            status=PaymentStatus.SUCCESS,
            transaction_id="TXN-UPI-984210",
            upi_id="priya@okhdfcbank",
        )
        pay2 = Payment(
            booking_id=b2.id,
            customer_id=customers[0].id,
            provider_id=p1.id,
            amount=380,
            payment_method=PaymentMethod.CARD,
            status=PaymentStatus.SUCCESS,
            transaction_id="TXN-CRD-773192",
            card_last4="4242",
            card_network="Visa",
        )
        db.add_all([pay1, pay2])
        db.commit()

        # ── Invoices ───────────────────────────────────────────────────────
        inv1 = Invoice(
            booking_id=b1.id, invoice_number="INV-000001",
            customer_id=customers[0].id, provider_id=p0.id,
            subtotal=450, total_amount=450, is_paid=True,
        )
        inv2 = Invoice(
            booking_id=b2.id, invoice_number="INV-000002",
            customer_id=customers[0].id, provider_id=p1.id,
            subtotal=380, total_amount=380, is_paid=True,
        )
        db.add_all([inv1, inv2])
        db.commit()

        # ── Reviews ────────────────────────────────────────────────────────
        r1 = Review(
            booking_id=b1.id,
            customer_id=customers[0].id,
            provider_id=p0.id,
            rating=5,
            comment="Excellent work! Ramesh fixed the wiring issue quickly and neatly. Highly recommend.",
            is_visible=True,
        )
        r2 = Review(
            booking_id=b2.id,
            customer_id=customers[0].id,
            provider_id=p1.id,
            rating=4,
            comment="Good service. Suresh fixed the kitchen sink leak. Was on time and professional.",
            is_visible=True,
        )
        db.add_all([r1, r2])
        db.commit()

        # ── Notifications ──────────────────────────────────────────────────
        db.add(Notification(
            user_id=customers[0].id,
            title="Booking Confirmed",
            message="Your booking with Ramesh Electric Works has been completed.",
            notification_type="success",
            is_read=True,
            related_booking_id=b1.id,
        ))
        db.add(Notification(
            user_id=customers[1].id,
            title="Provider on the Way",
            message="Meena's Home Care has accepted your booking and will arrive on Aug 12.",
            notification_type="info",
            is_read=False,
            related_booking_id=b3.id,
        ))
        db.commit()

        print("\n✅ Seed complete!")
        print("=" * 50)
        print("DEMO LOGIN CREDENTIALS")
        print("=" * 50)
        print("Admin:     admin@localpro.com    / admin123")
        print("Customer1: customer1@demo.com    / customer123")
        print("Customer2: customer2@demo.com    / customer123")
        print("Customer3: customer3@demo.com    / customer123")
        print("Provider1: provider1@demo.com    / provider123")
        print("Provider2: provider2@demo.com    / provider123")
        print("Provider3: provider3@demo.com    / provider123")
        print("Provider4: provider4@demo.com    / provider123")
        print("Provider5: provider5@demo.com    / provider123")
        print("Provider6: provider6@demo.com    / provider123")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
