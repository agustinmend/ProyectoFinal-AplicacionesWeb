import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Text, DateTime, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from shared.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"schema": "catalog"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))

class TShirt(Base):
    __tablename__ = "t_shirts"
    __table_args__ = {"schema": "catalog"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("catalog.categories.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    material = Column(String(100), nullable=True)
    base_price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))

    category = relationship("Category", backref="t_shirts")

class TShirtImage(Base):
    __tablename__ = "t_shirt_images"
    __table_args__ = {"schema": "catalog"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    t_shirt_id = Column(UUID(as_uuid=True), ForeignKey("catalog.t_shirts.id"), nullable=False)
    image = Column(String(100), nullable=False)
    is_primary = Column(Boolean, nullable=False, default=False)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))

    t_shirt = relationship("TShirt", backref="images")

class TShirtSize(Base):
    __tablename__ = "t_shirt_sizes"
    __table_args__ = (
        UniqueConstraint('t_shirt_id', 'size_label', name='uix_t_shirt_size'),
        {"schema": "catalog"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    t_shirt_id = Column(UUID(as_uuid=True), ForeignKey("catalog.t_shirts.id", ondelete="CASCADE"), nullable=False)
    size_label = Column(String(10), nullable=False)
    is_available = Column(Boolean, nullable=False, default=True)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))

    t_shirt = relationship("TShirt", backref="sizes")

class PresetDesign(Base):
    __tablename__ = "preset_designs"
    __table_args__ = {"schema": "catalog"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    image = Column(String(100), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created = Column(DateTime(timezone=True), server_default=text("now()"))
    modified = Column(DateTime(timezone=True), server_default=text("now()"))