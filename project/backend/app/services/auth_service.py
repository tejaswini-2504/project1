from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.provider import Provider
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token


def register_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        full_name=data.full_name.strip(),
        email=data.email.strip().lower(),
        phone=data.phone.strip() if data.phone else None,
        hashed_password=hash_password(data.password),
        role=data.role,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    if role_str == "provider":
        existing_provider = db.query(Provider).filter(Provider.user_id == user.id).first()
        if not existing_provider:
            provider = Provider(
                user_id=user.id,
                business_name=user.full_name,
                is_active=True,
                is_available=True,
                is_verified=True,
            )
            db.add(provider)
            db.commit()

    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    clean_email = email.strip().lower() if email else ""
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account suspended")
    return user


def create_token_for_user(user: User) -> str:
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    return create_access_token({"sub": str(user.id), "role": role_str})

