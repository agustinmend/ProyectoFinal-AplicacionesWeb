import uuid
from sqlalchemy import Column, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from shared.database import Base

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = {"schema": "ugc"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False)
    t_shirt_id = Column(UUID(as_uuid=True), nullable=False)
    created = Column(DateTime(timezone=True), server_default=text("now()"))

