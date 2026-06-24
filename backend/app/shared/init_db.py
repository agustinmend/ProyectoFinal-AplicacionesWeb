from sqlalchemy import text
from shared.database import engine
from modules.auth.models import User, OAuthAccount, RefreshToken
from modules.catalog.models import Category, TShirt, TShirtImage, PresetDesign
from modules.ugc.models import Favorite


def init_db():
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS catalog;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS negocio;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ugc;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS notif;"))
        conn.commit()

        # Eliminar constraints de llaves foráneas en ugc.favorites si existen
        try:
            conn.execute(text("""
                DO $$
                DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT constraint_name 
                        FROM information_schema.table_constraints 
                        WHERE table_schema = 'ugc' 
                          AND table_name = 'favorites' 
                          AND constraint_type = 'FOREIGN KEY'
                    ) LOOP
                        EXECUTE 'ALTER TABLE ugc.favorites DROP CONSTRAINT ' || r.constraint_name;
                    END LOOP;
                END;
                $$;
            """))
            conn.commit()
            print("Constraints de llaves foráneas en favoritos eliminadas con éxito.")
        except Exception as e:
            print(f"Error al eliminar constraints en favoritos: {e}")


    engine.dispose()
    from shared.database import Base
    Base.metadata.create_all(bind=engine)
    print("Base de datos inicializada correctamente.")


if __name__ == "__main__":
    init_db()