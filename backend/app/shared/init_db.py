from sqlalchemy import text
from shared.database import engine
from modules.auth.models import User, OAuthAccount, RefreshToken
from modules.catalog.models import Category, TShirt, TShirtImage
from modules.ugc.models import Favorite


def init_db():
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS catalog;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS negocio;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ugc;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS notif;"))
        conn.commit()

    engine.dispose()
    from shared.database import Base
    Base.metadata.create_all(bind=engine)
    print("Base de datos inicializada correctamente.")


if __name__ == "__main__":
    init_db()