import type { Tshirt } from '../../../models/types';
import './TshirtCard.css';

interface TshirtCardProps {
    tshirt: Tshirt;
    categoryName: string;
    onClick?: () => void;
}

export function TshirtCard({ tshirt, categoryName, onClick }: TshirtCardProps) {
    const formatPrice = (priceStr: string) => {
        const value = parseFloat(priceStr);
        if (isNaN(value)) return '$0';
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
        }).format(value);
    };

    const cardClass = tshirt.is_active
        ? 'tshirt-card'
        : 'tshirt-card tshirt-card--inactive';

    return (
        <article className={cardClass} onClick={onClick}>
            <div className="tshirt-card__image-container">
                {/* 
          Usamos una imagen de stock premium de poleras como placeholder.
          En el futuro la reemplazaremos por la imagen específica de cada polera o el visor.
        */}
                <img
                    className="tshirt-card__image"
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"
                    alt={tshirt.name}
                    loading="lazy"
                />
            </div>
            <div className="tshirt-card__content">
                <div className="tshirt-card__info-row">
                    <h3 className="tshirt-card__title">{tshirt.name}</h3>
                    <span className="tshirt-card__price">{formatPrice(tshirt.base_price)}</span>
                </div>
                <div className="tshirt-card__details-row">
                    <span className="tshirt-card__category">{categoryName}</span>
                    <div className="tshirt-card__colors">
                        <span className="tshirt-card__color-dot tshirt-card__color-dot--white" title="Blanco"></span>
                        <span className="tshirt-card__color-dot tshirt-card__color-dot--black" title="Negro"></span>
                    </div>
                </div>
            </div>
        </article>
    );
}
