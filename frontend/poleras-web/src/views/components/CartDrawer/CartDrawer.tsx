import { useState } from 'react';
import type { Tshirt } from '../../../models/types';
import './CartDrawer.css';

interface CartItem {
  tshirt: Tshirt;
  size: string;
  color: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  onRemove: (id: string, size: string, color: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onClearCart,
}: CartDrawerProps) {
  const [loading, setLoading] = useState(false);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.tshirt.base_price);
      return sum + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);
  };

  const formatPrice = (priceNum: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(priceNum);
  };

  const handleCotizar = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // Mapear elementos del carrito al esquema esperado por el backend
      const items = cart.map((item) => ({
        tshirt_id: String(item.tshirt.id),
        name: item.tshirt.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: parseFloat(item.tshirt.base_price),
        image_url: item.tshirt.image_url || null,
        description: item.tshirt.description || null,
      }));

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8001/negocio/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la cotización en el servidor.');
      }

      const data = await response.json();
      
      // Abrir enlace de WhatsApp en pestaña nueva
      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank');
      } else {
        throw new Error('La URL de WhatsApp no fue devuelta por el servidor.');
      }

      // Limpiar carrito y cerrar barra lateral
      onClearCart();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`⚠️ Hubo un problema al procesar la cotización: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fondo borroso (Overlay) */}
      <div
        className={`cart-drawer-overlay ${isOpen ? 'cart-drawer-overlay--open' : ''}`}
        onClick={onClose}
      />

      {/* Contenedor del Drawer */}
      <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}>
        {/* Cabecera */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            Tu Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button className="cart-drawer__close-btn" onClick={onClose} title="Cerrar carrito">
            ✕
          </button>
        </div>

        {/* Lista de Ítems */}
        <div className="cart-drawer__content">
          {cart.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">🛒</span>
              <p className="cart-drawer__empty-text">Tu carrito está vacío.</p>
              <button className="cart-drawer__continue-btn" onClick={onClose}>
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="cart-drawer__items-list">
              {cart.map((item, index) => {
                const itemPrice = parseFloat(item.tshirt.base_price);
                const subtotalItem = (isNaN(itemPrice) ? 0 : itemPrice) * item.quantity;

                return (
                  <div key={`${item.tshirt.id}-${item.size}-${item.color}-${index}`} className="cart-item">
                    <div className="cart-item__image-container">
                      <img
                        className="cart-item__image"
                        src={item.tshirt.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"}
                        alt={item.tshirt.name}
                      />
                    </div>
                    <div className="cart-item__details">
                      <h3 className="cart-item__name">{item.tshirt.name}</h3>
                      <p className="cart-item__meta">
                        Talla: {item.size} | Color: {item.color}
                      </p>
                      {item.tshirt.image_url && (
                        <a 
                          href={item.tshirt.image_url} 
                          download={`${item.tshirt.name.replace(/\s+/g, '_')}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="cart-item__download-link"
                          style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', display: 'block', marginTop: '4px' }}
                        >
                          Descargar Imagen del Diseño 📥
                        </a>
                      )}
                      
                      <div className="cart-item__actions-row">
                        {/* Selector de cantidad */}
                        <div className="cart-item__quantity-selector">
                          <button
                            className="cart-item__qty-btn"
                            onClick={() =>
                              onUpdateQuantity(item.tshirt.id, item.size, item.color, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="cart-item__qty-value">{item.quantity}</span>
                          <button
                            className="cart-item__qty-btn"
                            onClick={() =>
                              onUpdateQuantity(item.tshirt.id, item.size, item.color, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        {/* Eliminar ítem */}
                        <button
                          className="cart-item__delete-btn"
                          onClick={() => onRemove(item.tshirt.id, item.size, item.color)}
                          title="Eliminar de carrito"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="cart-item__price-info">
                      <span className="cart-item__price-total">{formatPrice(subtotalItem)}</span>
                      {item.quantity > 1 && (
                        <span className="cart-item__price-unit">
                          ({formatPrice(itemPrice)} c/u)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie del Drawer */}
        {cart.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span className="cart-drawer__subtotal-label">Subtotal</span>
              <span className="cart-drawer__subtotal-value">
                {formatPrice(calculateSubtotal())}
              </span>
            </div>

            <p className="cart-drawer__notice">
              La compra se finaliza y coordina mediante WhatsApp.
            </p>

            <button
              className="cart-drawer__checkout-btn"
              onClick={handleCotizar}
              disabled={loading}
            >
              {loading ? (
                <div className="cart-drawer__spinner"></div>
              ) : (
                'Cotizar vía WhatsApp'
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
