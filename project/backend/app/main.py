from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import (
    APP_TITLE, APP_DESCRIPTION, APP_VERSION, CORS_ORIGINS
)
from app.database.connection import engine
from app.database.base import Base

# Import all models so SQLAlchemy registers them before create_all
from app.models import (  # noqa: F401
    user, provider, category, service, booking,
    payment, review, invoice, notification, availability,
    complaint, ai_request, message, address
)

# Routers
from app.routers import auth, users, services, providers, bookings, payments, reviews, ai, admin

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for SQLite
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        payments_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(payments)")).fetchall()]
        if payments_cols:
            needed_cols = [
                ("customer_id", "INTEGER"),
                ("provider_id", "INTEGER"),
                ("transaction_id", "VARCHAR(100)"),
                ("upi_id", "VARCHAR(100)"),
                ("card_last4", "VARCHAR(10)"),
                ("card_network", "VARCHAR(30)"),
                ("notes", "TEXT"),
                ("gateway_response", "TEXT"),
                ("updated_at", "DATETIME"),
            ]
            for col_name, col_type in needed_cols:
                if col_name not in payments_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE payments ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    except Exception as ce:
                        print(f"Column migration info ({col_name}): {ce}")
except Exception as me:
    print(f"Migration error: {me}")

# Auto-seed if database is brand new and empty
try:
    from app.database.connection import SessionLocal
    from app.models.user import User
    _db = SessionLocal()
    if _db.query(User).count() == 0:
        import sys
        from pathlib import Path
        _root = Path(__file__).parent.parent.parent
        _db_script_dir = _root / "database"
        if str(_db_script_dir) not in sys.path:
            sys.path.insert(0, str(_db_script_dir))
        try:
            import seed as seed_module
            seed_module.seed()
        except Exception as se:
            print(f"Seed info: {se}")
    _db.close()
except Exception as e:
    print(f"Startup DB check: {e}")


app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow development frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Mount all routers under /api
API_PREFIX = "/api"
app.include_router(auth.router,      prefix=API_PREFIX)
app.include_router(users.router,     prefix=API_PREFIX)
app.include_router(services.router,  prefix=API_PREFIX)
app.include_router(providers.router, prefix=API_PREFIX)
app.include_router(bookings.router,  prefix=API_PREFIX)
app.include_router(payments.router,  prefix=API_PREFIX)
app.include_router(reviews.router,   prefix=API_PREFIX)
app.include_router(ai.router,        prefix=API_PREFIX)
app.include_router(admin.router,     prefix=API_PREFIX)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint – verifies API and database are running."""
    from sqlalchemy import text
    from app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"
    finally:
        db.close()
    return {
        "status": "ok",
        "api": "LocalPro API",
        "version": APP_VERSION,
        "database": db_status,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to LocalPro API",
        "docs": "/docs",
        "health": "/api/health",
    }
