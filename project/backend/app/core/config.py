import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# Resolve database path relative to project root
_project_root = Path(__file__).parent.parent.parent.parent
DATABASE_FILE = _project_root / "database" / "app.db"
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or DATABASE_URL.startswith("sqlite:///.."):
    DATABASE_URL = f"sqlite:///{DATABASE_FILE.resolve().as_posix()}"


SECRET_KEY: str = os.getenv("SECRET_KEY", "localpro-super-secret-jwt-key-change-in-production")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
]

APP_TITLE = "LocalPro API"
APP_DESCRIPTION = "AI-Powered Local Services & Small Business Platform"
APP_VERSION = "1.0.0"
