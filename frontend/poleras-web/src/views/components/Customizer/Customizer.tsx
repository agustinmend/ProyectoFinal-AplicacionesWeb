import { useState, useEffect, useRef } from 'react';
import type { Tshirt, PresetDesing } from '../../../models/types';
import { CatalogoServicio } from '../../../models/catalogoServicio';
import './Customizer.css';

interface CustomizerProps {
    onAddToCart: (tshirt: Tshirt, size: string, color: string) => void;
    onClose: () => void;
}

export function Customizer({ onAddToCart, onClose }: CustomizerProps) {
    const [selectedColor, setSelectedColor] = useState<string>('Blanco');
    const [selectedSize, setSelectedSize] = useState<string>('M');
    const [selectedTshirtId, setSelectedTshirtId] = useState<string>('');
    const [selectedDesignId, setSelectedDesignId] = useState<string>('none');

    // Diseños predeterminados del backend
    const [presetDesigns, setPresetDesigns] = useState<PresetDesing[]>([]);

    // Poleras base reales de la base de datos
    const [baseTshirts, setBaseTshirts] = useState<Tshirt[]>([]);

    // Diseño subido por el usuario
    const [customImageFile, setCustomImageFile] = useState<File | null>(null);
    const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [instructions, setInstructions] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [designSize, setDesignSize] = useState<number>(100); // 30 to 200 %
    const [designX, setDesignX] = useState<number>(0);         // -50 to 50 %
    const [designY, setDesignY] = useState<number>(0);         // -50 to 50 %
    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

    // Cargar los diseños predeterminados y seleccionar el primer t-shirt por defecto
    useEffect(() => {
        const cs = new CatalogoServicio();
        cs.getDiseñosPredeterminados().then(data => {
            setPresetDesigns(data);
        }).catch(err => {
            console.error('Error fetching preset designs:', err);
        });

        cs.getBaseTshirts().then(data => {
            setBaseTshirts(data);
            if (data.length > 0) {
                setSelectedTshirtId(data[0].id);
            }
        }).catch(err => {
            console.error('Error fetching base tshirts in customizer:', err);
        });
    }, []);

    const activeTshirt = baseTshirts.find(t => t.id === selectedTshirtId) || baseTshirts[0];

    // URLs de plantillas de poleras
    const whiteTshirtTemplate = "https://classicfella.com/cdn/shop/files/TShirt_White_Trans_0.5x_8537c1fa-10c5-4246-b7fb-55ff5b3a9eb1.png";
    const blackTshirtTemplate = "https://dsrcv.com/cdn/shop/files/T-SHIRT-black_600x.jpg?v=1756292835";

    const tshirtTemplateSrc = selectedColor === 'Blanco' ? whiteTshirtTemplate : blackTshirtTemplate;

    // Obtener la imagen de diseño a sobreponer en la polera
    let designOverlaySrc = '';
    if (selectedDesignId !== 'none') {
        const selectedPreset = presetDesigns.find(d => d.id === selectedDesignId);
        if (selectedPreset) {
            designOverlaySrc = selectedPreset.image_url;
        }
    } else if (customImagePreview) {
        designOverlaySrc = customImagePreview;
    }

    useEffect(() => {
        setIsImageLoaded(false);
    }, [designOverlaySrc]);

    // Manejar subida de archivo
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar formato
        const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
        const fileExtension = file.type;

        if (!validExtensions.includes(fileExtension)) {
            setErrorMessage('Formato no válido. Por favor, sube una imagen PNG, JPG o JPEG.');
            setCustomImageFile(null);
            setCustomImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        setCustomImageFile(file);

        try {
            const cs = new CatalogoServicio();
            const serverUrl = await cs.uploadDesign(file);
            setCustomImagePreview(serverUrl);
            setSelectedDesignId('none');
        } catch (error: any) {
            console.error('Error al subir diseño:', error);
            setErrorMessage(error.message || 'Error al subir la imagen. Por favor, reinténtalo.');
            setCustomImageFile(null);
            setCustomImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Cambiar diseño predeterminado
    const handleDesignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedDesignId(val);
        setErrorMessage(null);

        // Si selecciona un diseño predeterminado, se limpia el diseño propio
        if (val !== 'none') {
            setCustomImageFile(null);
            setCustomImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddToCart = () => {
        setErrorMessage(null);

        if (selectedDesignId === 'none' && !customImagePreview) {
            setErrorMessage('Por favor, selecciona un diseño predeterminado o sube tu propia imagen.');
            return;
        }

        if (!activeTshirt) {
            setErrorMessage('Por favor, selecciona un tipo de polera válido.');
            return;
        }

        const designName = selectedDesignId === 'none'
            ? 'Diseño Propio'
            : (presetDesigns.find(d => d.id === selectedDesignId)?.name || 'Diseño Predeterminado');

        // Formar el producto personalizado
        const customizedTshirt: Tshirt = {
            id: `custom-${Math.random().toString(36).substr(2, 9)}`,
            categoryid: activeTshirt.categoryid,
            name: `${activeTshirt.name} (Personalizada: ${designName})`,
            description: `Diseño: ${designName}. Ajustes - Tamaño: ${designSize}%, X: ${designX}%, Y: ${designY}%.` + (instructions.trim() ? ` Instrucciones: ${instructions.trim()}` : ''),
            base_price: activeTshirt.base_price,
            is_active: true,
            image_url: selectedDesignId === 'none' ? (customImagePreview || '') : designOverlaySrc
        };

        onAddToCart(customizedTshirt, selectedSize, selectedColor);
        onClose(); // Regresar al catálogo
    };

    // Formatear precio
    const formatPrice = (priceStr: string) => {
        const val = parseFloat(priceStr);
        if (isNaN(val)) return '$0';
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB'
        }).format(val);
    };

    return (
        <div className="customizer-container">
            <div className="customizer-header-row">
                <button className="customizer-back-btn" onClick={onClose}>
                    ← Volver al Catálogo
                </button>
                <div className="customizer-title-group">
                    <h2 className="customizer-title">Crea tu Polera</h2>
                    <p className="customizer-subtitle">Un flujo simple para personalizar tu polera. Elige color, talla y sube tu diseño.</p>
                </div>
            </div>

            <div className="customizer-main-grid">
                {/* PANEL IZQUIERDO: VISTA PREVIA */}
                <div className="customizer-preview-panel">
                    <div className="customizer-canvas-container">
                        <img
                            className="customizer-canvas-tshirt"
                            src={tshirtTemplateSrc}
                            alt={`Polera base ${selectedColor}`}
                        />
                        {/* Área de diseño sobrepuesta */}
                        <div className={`customizer-design-area ${isImageLoaded ? 'customizer-design-area--hidden-border' : ''}`}>
                            {!isImageLoaded && <span className="customizer-design-area-label">Área de Diseño</span>}
                            {designOverlaySrc && (
                                <img
                                    className="customizer-design-overlay"
                                    src={designOverlaySrc}
                                    alt="Overlay de diseño"
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
                </div>

                {/* PANEL DERECHO: OPCIONES */}
                <div className="customizer-options-panel">
                    {/* 1. Selecciona el Color */}
                    <div className="customizer-option-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-num">1.</span>
                            <span className="customizer-section-title">Selecciona el Color</span>
                            <span className="customizer-section-value">{selectedColor}</span>
                        </div>
                        <div className="customizer-colors-row">
                            <button
                                className={`customizer-color-circle customizer-color-circle--white ${selectedColor === 'Blanco' ? 'customizer-color-circle--active' : ''}`}
                                onClick={() => setSelectedColor('Blanco')}
                                title="Blanco"
                            />
                            <button
                                className={`customizer-color-circle customizer-color-circle--black ${selectedColor === 'Negro' ? 'customizer-color-circle--active' : ''}`}
                                onClick={() => setSelectedColor('Negro')}
                                title="Negro"
                            />
                        </div>
                    </div>

                    {/* 2. Selecciona la Talla */}
                    <div className="customizer-option-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-num">2.</span>
                            <span className="customizer-section-title">Selecciona la Talla</span>
                        </div>
                        <div className="customizer-sizes-row">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <button
                                    key={size}
                                    className={`customizer-size-btn ${selectedSize === size ? 'customizer-size-btn--active' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Selecciona el tipo de polera */}
                    <div className="customizer-option-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-num">3.</span>
                            <span className="customizer-section-title">Selecciona el tipo de polera</span>
                        </div>
                        <select
                            className="customizer-select"
                            value={selectedTshirtId}
                            onChange={(e) => setSelectedTshirtId(e.target.value)}
                        >
                            {baseTshirts.map(tshirt => (
                                <option key={tshirt.id} value={tshirt.id}>
                                    {tshirt.name} ({formatPrice(tshirt.base_price)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3.5. Diseño predeterminado */}
                    <div className="customizer-option-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-num">3.5</span>
                            <span className="customizer-section-title">Diseño predeterminado</span>
                        </div>
                        <select
                            className="customizer-select"
                            value={selectedDesignId}
                            onChange={handleDesignChange}
                        >
                            <option value="none">Ninguno (Subir mi propio diseño)</option>
                            {presetDesigns.map(design => (
                                <option key={design.id} value={design.id}>
                                    {design.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Tu Diseño (Subida de archivo) */}
                    {selectedDesignId === 'none' && (
                        <div className="customizer-option-section">
                            <div className="customizer-section-header">
                                <span className="customizer-section-num">4.</span>
                                <span className="customizer-section-title">Tu Diseño</span>
                            </div>
                            <div className={`customizer-upload-box ${isUploading ? 'customizer-upload-box--uploading' : ''}`} onClick={isUploading ? undefined : triggerFileInput}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept=".png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <div className="customizer-upload-content">
                                    <span className="customizer-upload-icon">{isUploading ? '⏳' : '📤'}</span>
                                    <span className="customizer-upload-text">
                                        {isUploading
                                            ? 'Subiendo diseño al servidor...'
                                            : (customImageFile ? customImageFile.name : 'Subir Imagen (PNG/JPG)')}
                                    </span>
                                </div>
                            </div>
                            {customImageFile && !isUploading && (
                                <button
                                    className="customizer-upload-clear-btn"
                                    onClick={() => {
                                        setCustomImageFile(null);
                                        setCustomImagePreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    Eliminar Imagen 🗑️
                                </button>
                            )}
                        </div>
                    )}

                    {/* Ajustes de Estampado */}
                    <div className="customizer-option-section customizer-metrics-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-title">Ajustar Estampado</span>
                        </div>
                        
                        <div className="customizer-metric-control">
                            <div className="customizer-metric-info">
                                <span>Tamaño: {designSize}%</span>
                            </div>
                            <input
                                type="range"
                                className="customizer-range"
                                min="30"
                                max="200"
                                value={designSize}
                                onChange={(e) => setDesignSize(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="customizer-metric-control">
                            <div className="customizer-metric-info">
                                <span>Posición Horizontal (X): {designX > 0 ? `+${designX}` : designX}%</span>
                            </div>
                            <input
                                type="range"
                                className="customizer-range"
                                min="-50"
                                max="50"
                                value={designX}
                                onChange={(e) => setDesignX(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="customizer-metric-control">
                            <div className="customizer-metric-info">
                                <span>Posición Vertical (Y): {designY > 0 ? `+${designY}` : designY}%</span>
                            </div>
                            <input
                                type="range"
                                className="customizer-range"
                                min="-50"
                                max="50"
                                value={designY}
                                onChange={(e) => setDesignY(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Instrucciones adicionales */}
                    <div className="customizer-option-section">
                        <div className="customizer-section-header">
                            <span className="customizer-section-title">Instrucciones de diseño (Opcional)</span>
                        </div>
                        <textarea
                            className="customizer-textarea"
                            placeholder="Ej: Quiero el logo en el centro del pecho, tamaño pequeño..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>

                    {/* Alerta de Error */}
                    {errorMessage && (
                        <div className="customizer-error-alert">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {/* Footer de Precio y Checkout */}
                    <div className="customizer-checkout-section">
                        <div className="customizer-price-row">
                            <span className="customizer-price-label">Precio Estimado</span>
                            <span className="customizer-price-value">
                                {activeTshirt ? formatPrice(activeTshirt.base_price) : '$0'}
                            </span>
                        </div>
                        <button className="customizer-submit-btn" onClick={handleAddToCart}>
                            Agregar a la Cotización
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
