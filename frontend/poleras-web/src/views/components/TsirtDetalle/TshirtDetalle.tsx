import { useState } from 'react';
import type { Tshirt } from '../../../models/types';
import './TshirtDetalle.css';

interface TshirtDetalleProps {
  tshirt: Tshirt | null;
  onClose: () => void;
  onAddToCart: (tshirt: Tshirt, size: string, color: string) => void;
}

export function TshirtDetalle({ tshirt, onClose, onAddToCart }: TshirtDetalleProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Blanco'); // Blanco o Negro

  if (!tshirt) return null;

  const formatPrice = (priceStr: string) => {
    const value = parseFloat(priceStr);
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(value);
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Negro', value: '#000000' }
  ];

  return (
    <div className="tshirt-details-overlay" onClick={onClose}>
      <div className="tshirt-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tshirt-details-modal__close" onClick={onClose} title="Cerrar">
          &times;
        </button>

        <div className="tshirt-details-modal__image-container">
          <img
            className="tshirt-details-modal__image"
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"
            alt={tshirt.name}
          />
        </div>

        <div className="tshirt-details-modal__info">
          <div className="tshirt-details-modal__header">
            <span className="tshirt-details-modal__category">Polera</span>
            <h2 className="tshirt-details-modal__title">{tshirt.name}</h2>
            <div className="tshirt-details-modal__price">{formatPrice(tshirt.base_price)}</div>
          </div>

          <p className="tshirt-details-modal__description">
            {tshirt.description || 'Polera clásica confeccionada en algodón premium de alta calidad. Ideal para estampados y bordados personalizados o uso cotidiano.'}
          </p>

          {/* Selector de Color */}
          <div className="tshirt-details-modal__section">
            <span className="tshirt-details-modal__section-label">Color: {selectedColor}</span>
            <div className="tshirt-details-modal__color-list">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`tshirt-details-modal__color-circle ${
                    selectedColor === color.name ? 'tshirt-details-modal__color-circle--active' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Selector de Tallas */}
          <div className="tshirt-details-modal__section">
            <span className="tshirt-details-modal__section-label">Seleccionar Talla</span>
            <div className="tshirt-details-modal__size-list">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`tshirt-details-modal__size-btn ${
                    selectedSize === size ? 'tshirt-details-modal__size-btn--active' : ''
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            className="tshirt-details-modal__add-btn"
            onClick={() => onAddToCart(tshirt, selectedSize, selectedColor)}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
