import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useCatalog } from './controllers/catalogoUse';
import { TshirtCard } from './views/components/TshirtCard/TshirtCard';
import { TshirtDetalle } from './views/components/TsirtDetalle/TshirtDetalle'; // Corregido el .tsx del import
import { CartDrawer } from './views/components/CartDrawer/CartDrawer';
import type { Tshirt } from './models/types';
import './views/styles/App.css';

const LoginScreen = lazy(() => import('./views/components/Login/Login').then(module => ({ default: module.Login })));

function CatalogoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, selectedCategoryId, tshirts, loading, error, selectCategory } = useCatalog(searchQuery);
  const [selectedTshirt, setSelectedTshirt] = useState<Tshirt | null>(null);
  const [cart, setCart] = useState<{ tshirt: Tshirt; size: string; color: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredTshirts = tshirts;

  const handlePersonalizeClick = () => {
    alert('¡Próximamente! Redirigiendo al customizador de poleras...');
  };

  const handleAddToCart = (tshirt: Tshirt, size: string, color: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.tshirt.id === tshirt.id && item.size === size && item.color === color
      );
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { tshirt, size, color, quantity: 1 }];
    });
    setSelectedTshirt(null);
    setIsCartOpen(true);
  };

  const handleViewCart = () => {
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (tshirtId: string, size: string, color: string, newQty: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.tshirt.id === tshirtId && item.size === size && item.color === color
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (tshirtId: string, size: string, color: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.tshirt.id === tshirtId && item.size === size && item.color === color)
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header__brand">
          <h1 className="header__title">Poleras<span>BO.</span></h1>
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
          <Link to="/login" className="header__btn header__btn--login" title="Iniciar Sesión" style={{ textDecoration: 'none' }}>
            <span className="header__btn-icon">👤</span>
            <span className="header__btn-text">Ingresar</span>
          </Link>

          <button className="header__btn header__btn--cart" title="Ver Carrito" onClick={handleViewCart}>
            <span className="header__btn-icon">🛒</span>
            <span className="header__cart-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

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
              const category = categories.find((c) => c.id === tshirt.categoryid);
              const categoryName = category ? category.name : 'Polera';

              return (
                <TshirtCard
                  key={tshirt.id}
                  tshirt={tshirt}
                  categoryName={categoryName}
                  onClick={() => setSelectedTshirt(tshirt)}
                />
              );
            })}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 PolerasBO - Proyecto Final Aplicaciones Web. Todos los derechos reservados.</p>
      </footer>

      <TshirtDetalle
        tshirt={selectedTshirt}
        onClose={() => setSelectedTshirt(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Suspense atrapa los componentes con Lazy Load mientras se descargan */}
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>Cargando interfaz...</h2>
        </div>
      }>
        <Routes>
          <Route path="/" element={<CatalogoScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;