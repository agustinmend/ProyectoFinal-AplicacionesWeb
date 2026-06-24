import { useState, useEffect } from 'react';
import type { Tshirt } from '../../../models/types';
import { CatalogoServicio } from '../../../models/catalogoServicio';
import './TshirtDetalle.css';

interface TshirtDetalleProps {
  tshirt: Tshirt | null;
  isFavorite: boolean;
  onToggleFavorite: (tshirtId: string) => void;
  onClose: () => void;
  onAddToCart: (tshirt: Tshirt, size: string, color: string) => void;
}

export function TshirtDetalle({ tshirt, isFavorite, onToggleFavorite, onClose, onAddToCart }: TshirtDetalleProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Blanco'); // Blanco o Negro
  const [baseTshirts, setBaseTshirts] = useState<Tshirt[]>([]);
  const [selectedTshirtId, setSelectedTshirtId] = useState<string>('');

  const [designSize, setDesignSize] = useState<number>(100); // 30 to 200 %
  const [designX, setDesignX] = useState<number>(0);         // -50 to 50 %
  const [designY, setDesignY] = useState<number>(0);         // -50 to 50 %
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [tshirt?.image_url]);

  useEffect(() => {
    const cs = new CatalogoServicio();
    cs.getBaseTshirts()
      .then((data) => {
        setBaseTshirts(data);
        if (tshirt) {
          const parts = tshirt.id.split('__');
          const initialTshirtId = parts.length > 1 ? parts[1] : (data.length > 0 ? data[0].id : '');
          setSelectedTshirtId(initialTshirtId);
        } else if (data.length > 0) {
          setSelectedTshirtId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching base tshirts in detail modal:', err);
      });
  }, [tshirt]);

  if (!tshirt) return null;

  const activeBaseTshirt = baseTshirts.find(b => b.id === selectedTshirtId) || baseTshirts[0];

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

  // Plantillas de poleras base
  const whiteTshirtTemplate = "https://classicfella.com/cdn/shop/files/TShirt_White_Trans_0.5x_8537c1fa-10c5-4246-b7fb-55ff5b3a9eb1.png";
  const blackTshirtTemplate = "https://dsrcv.com/cdn/shop/files/T-SHIRT-black_600x.jpg?v=1756292835";

  const tshirtTemplateSrc = selectedColor === 'Blanco' ? whiteTshirtTemplate : blackTshirtTemplate;

  const handleAddToCart = () => {
    if (!activeBaseTshirt) return;

    const designId = tshirt.id.split('__')[0];
    const designName = tshirt.name.includes(' con estampado ')
      ? tshirt.name.split(' con estampado ')[1]
      : tshirt.name;

    const cartProduct: Tshirt = {
      id: `custom-${designId}-${activeBaseTshirt.id}`,
      categoryid: activeBaseTshirt.categoryid,
      name: `${activeBaseTshirt.name} con estampado ${designName}`,
      description: `Estampado: ${designName}. Material: 'Algodón'}. Ajustes - Tamaño: ${designSize}%, X: ${designX}%, Y: ${designY}%.`,
      base_price: activeBaseTshirt.base_price,
      is_active: true,
      image_url: tshirt.image_url
    };
    onAddToCart(cartProduct, selectedSize, selectedColor);
    onClose();
  };

  return (
    <div className="tshirt-details-overlay" onClick={onClose}>
      <div className="tshirt-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tshirt-details-modal__close" onClick={onClose} title="Cerrar">
          &times;
        </button>

        {/* Panel izquierdo: Polera base con el estampado superpuesto */}
        <div className="tshirt-details-modal__image-container">
          <img
            className="tshirt-details-modal__image"
            src={tshirtTemplateSrc}
            alt={`Polera base ${selectedColor}`}
          />
          <div className={`tshirt-details-modal__design-area ${isImageLoaded ? 'tshirt-details-modal__design-area--hidden-border' : ''}`}>
            {!isImageLoaded && <span className="tshirt-details-modal__design-area-label">Área de Diseño</span>}
            {tshirt.image_url && (
              <img
                className="tshirt-details-modal__design-overlay"
                src={tshirt.image_url}
                alt={tshirt.name}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setIsImageLoaded(false)}
                style={{
                  position: 'absolute',
                  width: `${designSize}%`,
                  height: `${designSize}%`,
                  left: `calc(50% + ${designX}%)`,
                  top: `calc(50% + ${designY}%)`,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  display: isImageLoaded ? 'block' : 'none'
                }}
              />
            )}
          </div>
        </div>

        <div className="tshirt-details-modal__info">
          <div className="tshirt-details-modal__header">
            <span className="tshirt-details-modal__category">Estampado Predeterminado</span>
            <h2 className="tshirt-details-modal__title">{tshirt.name}</h2>
            <div className="tshirt-details-modal__price">
              {activeBaseTshirt ? formatPrice(activeBaseTshirt.base_price) : formatPrice(tshirt.base_price)}
            </div>
          </div>

          <p className="tshirt-details-modal__description">
            {tshirt.description || 'Diseño exclusivo estampado de alta calidad en polera base de algodón premium.'}
          </p>

          {/* Selector de Tipo de Polera (Base) */}
          <div className="tshirt-details-modal__section">
            <span className="tshirt-details-modal__section-label">Tipo de Polera Base</span>
            <select
              className="tshirt-details-modal__select"
              value={selectedTshirtId}
              onChange={(e) => setSelectedTshirtId(e.target.value)}
            >
              {baseTshirts.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name} ({formatPrice(base.base_price)})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Color */}
          <div className="tshirt-details-modal__section">
            <span className="tshirt-details-modal__section-label">Color: {selectedColor}</span>
            <div className="tshirt-details-modal__color-list">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`tshirt-details-modal__color-circle ${selectedColor === color.name ? 'tshirt-details-modal__color-circle--active' : ''
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
                  className={`tshirt-details-modal__size-btn ${selectedSize === size ? 'tshirt-details-modal__size-btn--active' : ''
                    }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Ajustar Estampado */}
          <div className="tshirt-details-modal__section tshirt-details-modal__metrics-section">
            <span className="tshirt-details-modal__section-label">Ajustar Estampado</span>

            <div className="tshirt-details-modal__metric-control">
              <div className="tshirt-details-modal__metric-info">
                <span>Tamaño: {designSize}%</span>
              </div>
              <input
                type="range"
                className="tshirt-details-modal__range"
                min="30"
                max="200"
                value={designSize}
                onChange={(e) => setDesignSize(parseInt(e.target.value))}
              />
            </div>

            <div className="tshirt-details-modal__metric-control">
              <div className="tshirt-details-modal__metric-info">
                <span>Posición Horizontal (X): {designX > 0 ? `+${designX}` : designX}%</span>
              </div>
              <input
                type="range"
                className="tshirt-details-modal__range"
                min="-50"
                max="50"
                value={designX}
                onChange={(e) => setDesignX(parseInt(e.target.value))}
              />
            </div>

            <div className="tshirt-details-modal__metric-control">
              <div className="tshirt-details-modal__metric-info">
                <span>Posición Vertical (Y): {designY > 0 ? `+${designY}` : designY}%</span>
              </div>
              <input
                type="range"
                className="tshirt-details-modal__range"
                min="-50"
                max="50"
                value={designY}
                onChange={(e) => setDesignY(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="tshirt-details-modal__actions">
            <button
              className="tshirt-details-modal__add-btn"
              onClick={handleAddToCart}
            >
              Agregar al Carrito
            </button>
            <button
              className={`tshirt-details-modal__fav-btn ${isFavorite ? 'tshirt-details-modal__fav-btn--active' : ''
                }`}
              onClick={() => onToggleFavorite(tshirt.id)}
              title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
