import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import select
import httpx
from .models import OAuthAccount
import os

from .models import User, RefreshToken
from .schemas import RegisterRequest, LoginRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-cambiame")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        raise ValueError("La contraseña no puede superar los 72 caracteres")
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_refresh_token() -> str:
    return str(uuid.uuid4())


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def register_user(db: Session, data: RegisterRequest) -> User:
    existing = db.execute(
        select(User).where(User.email == data.email)
    ).scalar_one_or_none()

    if existing:
        raise ValueError("El email ya está registrado")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role="cliente",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, data: LoginRequest) -> tuple[User, str, str]:
    user = db.execute(
        select(User).where(User.email == data.email)
    ).scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise ValueError("Credenciales incorrectas")

    if not user.is_active:
        raise ValueError("Usuario desactivado")

    access_token  = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token()

    token_hash = hash_password(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    db.add(RefreshToken(
        id=uuid.uuid4(),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))
    db.commit()

    return user, access_token, refresh_token


def refresh_access_token(db: Session, refresh_token: str) -> tuple[str, str]:
    tokens = db.execute(
        select(RefreshToken).where(RefreshToken.revoked == False)
    ).scalars().all()

    matched = next(
        (t for t in tokens if verify_password(refresh_token, t.token_hash)), None
    )

    if not matched or matched.expires_at < datetime.now(timezone.utc):
        raise ValueError("Refresh token inválido o expirado")

    matched.revoked = True

    user = db.execute(
        select(User).where(User.id == matched.user_id)
    ).scalar_one()

    new_access  = create_access_token(str(user.id), user.role)
    new_refresh = create_refresh_token()

    db.add(RefreshToken(
        id=uuid.uuid4(),
        user_id=user.id,
        token_hash=hash_password(new_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()

    return new_access, new_refresh

async def google_auth(db: Session, id_token: str) -> tuple[User, str, str]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {id_token}"}
        )

    if response.status_code != 200:
        raise ValueError("Token de Google inválido")

    data = response.json()
    google_id = data.get("sub")
    email     = data.get("email")
    full_name = data.get("name", email)

    if not google_id or not email:
        raise ValueError("No se pudo obtener información del usuario de Google")

    # Buscar si ya existe la cuenta OAuth
    oauth = db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "google",
            OAuthAccount.provider_user_id == google_id,
        )
    ).scalar_one_or_none()

    if oauth:
        user = db.execute(
            select(User).where(User.id == oauth.user_id)
        ).scalar_one()
    else:
        # Buscar si el email ya existe (usuario registrado normalmente)
        user = db.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

        if not user:
            user = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=None,
                full_name=full_name,
                role="cliente",
            )
            db.add(user)
            db.flush()  # para tener el id antes del commit

        db.add(OAuthAccount(
            id=uuid.uuid4(),
            user_id=user.id,
            provider="google",
            provider_user_id=google_id,
        ))
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise ValueError("Usuario desactivado")

    access_token  = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token()

    db.add(RefreshToken(
        id=uuid.uuid4(),
        user_id=user.id,
        token_hash=hash_password(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()

    return user, access_token, refresh_token