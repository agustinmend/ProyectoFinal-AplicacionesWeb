import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Text, DateTime, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from shared.database import Base

class QuoteConfig(UUIDMixin, TimeStampedMixin):
    __tablename__= "quote_configs"
    __table_args__ = {"schema": "negocio"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_type = Column(Column(String(50), unique=True, nullable=False))
    label = Column(String(100), unique=True, nullable=False)
    extra_cost = Column(Numeric(10,2), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))
