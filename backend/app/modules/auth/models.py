import uuid
from sqlalchemy import Column, String, Boolean, DateTime, text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from shared.database import Base
import enum

class UserRole(str, enum.Enum):
    CLIENTE = "cliente"
    MODERADOR = "moderador"
    ADMINISTRADOR = "administrador"

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'auth'}

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name     = Column(String(255), nullable=False)
    role          = Column(SQLEnum(UserRole), nullable=False, default=UserRole.CLIENTE)
    is_active     = Column(Boolean, nullable=False, default=True)
    created       = Column(DateTime(timezone=True), server_default=text('now()'))
    modified      = Column(DateTime(timezone=True), server_default=text('now()'))


class OAuthAccount(Base):
    __tablename__ = 'oauth_accounts'
    __table_args__ = {'schema': 'auth'}

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), nullable=False)
    provider         = Column(String(50), nullable=False)
    provider_user_id = Column(String(255), nullable=False)
    linked_at        = Column(DateTime(timezone=True), server_default=text('now()'))


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    __table_args__ = {'schema': 'auth'}

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), nullable=False)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked    = Column(Boolean, nullable=False, default=False)