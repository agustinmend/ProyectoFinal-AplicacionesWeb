import { useState } from 'react';
import { useCatalog } from './controllers/catalogoUse';
import { TshirtCard } from './views/components/TshirtCard/TshirtCard';
import './views/styles/App.css';

function App() {
  const { categories, selectedCategoryId, tshirts, loading, error, selectCategory } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrado de poleras por texto de búsqueda (cliente)
  const filteredTshirts = tshirts.filter((tshirt) =>
    tshirt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonalizeClick = () => {
    alert('¡Próximamente! Redirigiendo al customizador de poleras...');
  };

  return (
    <div className="app-container">
      {/* 1. ENCABEZADO (HEADER) */}
      <header className="header">
        <div className="header__brand">
          <h1 className="header__title">Poleras<span>BO</span></h1>
        </div>

        <div className="header__search-container">
          <input
            type="text"
            className="header__search-input"
            placeholder="Buscar poleras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="header__search-icon">🔍</span>
        </div>

        <div className="header__actions">
          <button className="header__btn header__btn--login" title="Iniciar Sesión">
            <span className="header__btn-icon">👤</span>
            <span className="header__btn-text">Ingresar</span>
          </button>
          <button className="header__btn header__btn--cart" title="Carrito de Compras">
            <span className="header__btn-icon">🛒</span>
            <span className="header__cart-badge">0</span>
          </button>
        </div>
      </header>

      {/* 2. BANNER INFORMATIVO (HERO SECTION) */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__panel">
            <h2 className="hero__title">Diseña tu propio estilo</h2>
            <p className="hero__description">
              Elige entre nuestras poleras base de algodón premium, selecciona tu color preferido y añade tus diseños favoritos de manera 100% personalizada.
            </p>
          </div>
          <button className="hero__cta-btn" onClick={handlePersonalizeClick}>
            Personalizar Polera 🎨
          </button>
        </div>
      </section>

      {/* 3. BARRA DE CATEGORÍAS */}
      <section className="categories-section">
        <h3 className="section-title">Nuestras Colecciones</h3>
        <div className="categories-bar">
          <button
            className={`category-pill ${selectedCategoryId === '' ? 'category-pill--active' : ''}`}
            onClick={() => selectCategory('')}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-pill ${selectedCategoryId === category.id ? 'category-pill--active' : ''}`}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN DE POLERAS (LISTADO DE TARJETAS) */}
      <main className="catalog-section">
        {loading && (
          <div className="catalog-status">
            <div className="spinner"></div>
            <p>Cargando catálogo de productos...</p>
          </div>
        )}

        {error && !loading && (
          <div className="catalog-status catalog-status--error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && filteredTshirts.length === 0 && (
          <div className="catalog-status">
            <p>No se encontraron poleras en esta categoría.</p>
          </div>
        )}

        {!loading && !error && filteredTshirts.length > 0 && (
          <div className="catalog-grid">
            {filteredTshirts.map((tshirt) => {
              // Obtenemos el nombre de la categoría del listado principal
              const category = categories.find((c) => c.id === tshirt.categoryid);
              const categoryName = category ? category.name : 'Polera';

              return (
                <TshirtCard
                  key={tshirt.id}
                  tshirt={tshirt}
                  categoryName={categoryName}
                  onClick={() => console.log('Seleccionaste:', tshirt.name)}
                />
              );
            })}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 PolerasBO - Proyecto Final Aplicaciones Web. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
