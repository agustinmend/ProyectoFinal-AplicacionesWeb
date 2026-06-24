import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useCatalog } from './controllers/catalogoUse';
import { TshirtCard } from './views/components/TshirtCard/TshirtCard';
import { TshirtDetalle } from './views/components/TsirtDetalle/TshirtDetalle.tsx';
import { CartDrawer } from './views/components/CartDrawer/CartDrawer';
import { Customizer } from './views/components/Customizer/Customizer';
import { useAuth } from './context/AuthContext';
import type { Tshirt } from './models/types';
import './views/styles/App.css';

// Code Splitting obligatorio por ruta utilizando React.lazy + Suspense para optimizar el peso de los chunks
const LoginScreen = lazy(() => import('./views/components/Login/Login').then(module => ({ default: module.Login })));
const RegisterScreen = lazy(() => import('./views/components/Register/Register').then(module => ({ default: module.Register })));

function CatalogoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'catalog' | 'customizer'>('catalog');
  const { categories, selectedCategoryId, tshirts, favoriteIds, loading, error, selectCategory, toggleFavorite } = useCatalog(searchQuery);
  const [selectedTshirt, setSelectedTshirt] = useState<Tshirt | null>(null);
  const [cart, setCart] = useState<{ tshirt: Tshirt; size: string; color: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Consumo del estado global de autenticación requerido
  const { user, isAuthenticated, logout } = useAuth();

  const filteredTshirts = tshirts;

  const handlePersonalizeClick = () => {
    setView('customizer');
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
    setSelectedTshirt(null); // Cierra el modal de detalles
    setIsCartOpen(true); // Abre automáticamente el carrito lateral
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
      {/* 1. ENCABEZADO (HEADER) */}
      <header className="header">
        <div className="header__brand" onClick={() => setView('catalog')} style={{ cursor: 'pointer' }}>
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
          {/* Control reactivo del Header según el estado de sesión para diferenciar flujos visuales */}
          {isAuthenticated && user ? (
            <div className="header__user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="header__user-name" style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                {user.full_name}
              </span>
              {/* Si el rol es administrador, se expone el enlace al panel operativo */}
              {user.role === 'administrador' && (
                <Link to="/admin" className="header__btn header__btn--admin" style={{ textDecoration: 'none' }}>
                  Panel Admin
                </Link>
              )}
              <button onClick={logout} className="header__btn header__btn--logout" title="Cerrar Sesión">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="header__btn header__btn--login" title="Iniciar Sesión" style={{ textDecoration: 'none' }}>
              <span className="header__btn-icon">👤</span>
              <span className="header__btn-text">Ingresar</span>
            </Link>
          )}

          <button className="header__btn header__btn--cart" title="Ver Carrito" onClick={handleViewCart}>
            <span className="header__btn-icon">🛒</span>
            <span className="header__cart-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {view === 'catalog' ? (
        <>
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
              <button
                className={`category-pill ${selectedCategoryId === 'favoritos' ? 'category-pill--active' : ''}`}
                onClick={() => selectCategory('favoritos')}
              >
                Favoritos ❤️
              </button>
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
        </>
      ) : (
        <Customizer
          onAddToCart={handleAddToCart}
          onClose={() => setView('catalog')}
        />
      )}

      <footer className="footer">
        <p>&copy; 2026 PolerasBO - Proyecto Final Aplicaciones Web. Todos los derechos reservados.</p>
      </footer>

      {/* 5. MODAL DE DETALLE (REACT COMPONENT) */}
      <TshirtDetalle
        tshirt={selectedTshirt}
        isFavorite={selectedTshirt ? favoriteIds.includes(selectedTshirt.id.split('__')[0]) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedTshirt(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 6. CARRITO DESLIZABLE (CART DRAWER) */}
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
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', gap: '1rem' }}>
          <div className="spinner"></div>
          <p style={{ fontWeight: 500, color: '#4b5563' }}>Cargando aplicación...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={<CatalogoScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/registro" element={<RegisterScreen />} />
          
          {/* Ruta del Panel Administrativo integrado internamente dentro de la SPA */}
          <Route path="/admin" element={
            <div style={{ padding: '3rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Módulo de Administración</h1>
              <p style={{ color: '#4b5563', marginBottom: '2rem' }}>CRUD operativo y gestión del catálogo principal.</p>
              <Link to="/" style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}>Volver al catálogo público</Link>
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
