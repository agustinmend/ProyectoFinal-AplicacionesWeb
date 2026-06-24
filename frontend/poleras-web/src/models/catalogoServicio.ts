import type { Category, PresetDesing, Tshirt, TshirtSize } from "./types";
import { type ICatalogo } from "./catalogo";

// Datos simulados (mocks) idénticos a los del backend
const MOCK_CATEGORIES: Category[] = [
    { id: "11111111-0000-0000-0000-000000000001", name: "Básicas", slug: "basicas" },
    { id: "11111111-0000-0000-0000-000000000002", name: "Premium", slug: "premium" },
    { id: "11111111-0000-0000-0000-000000000003", name: "Deportivas", slug: "deportivas" },
    { id: "11111111-0000-0000-0000-000000000004", name: "Oversize", slug: "oversize" }
];

const MOCK_TSHIRTS: Tshirt[] = [
    {
        id: "22222222-0000-0000-0000-000000000001",
        categoryid: "11111111-0000-0000-0000-000000000001",
        name: "Polera cuello redondo básica",
        description: "Polera de algodón 100% con cuello redondo. Ideal para el día a día.",
        base_price: "99.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000002",
        categoryid: "11111111-0000-0000-0000-000000000001",
        name: "Polera cuello V básica",
        description: "Polera con escote en V de corte slim.",
        base_price: "10.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000003",
        categoryid: "11111111-0000-0000-0000-000000000002",
        name: "Polera premium pima",
        description: "Confeccionada con algodón pima peruano de primera calidad.",
        base_price: "18.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000004",
        categoryid: "11111111-0000-0000-0000-000000000002",
        name: "Polera premium modal",
        description: "Tela modal de origen bambú. Extremadamente suave y transpirable.",
        base_price: "21.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000005",
        categoryid: "11111111-0000-0000-0000-000000000003",
        name: "Polera deportiva dry-fit",
        description: "Tecnología de secado rápido para actividad física intensa.",
        base_price: "14.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000006",
        categoryid: "11111111-0000-0000-0000-000000000003",
        name: "Polera deportiva compresión",
        description: "Diseño de compresión muscular para mejorar el rendimiento.",
        base_price: "16.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000007",
        categoryid: "11111111-0000-0000-0000-000000000004",
        name: "Polera oversize urbana",
        description: "Corte amplio y caído con hombros caídos.",
        base_price: "13.00",
        is_active: true
    },
    {
        id: "22222222-0000-0000-0000-000000000008",
        categoryid: "11111111-0000-0000-0000-000000000004",
        name: "Polera oversize crop",
        description: "Versión corta del oversize clásico. Diseño moderno y versátil.",
        base_price: "12.00",
        is_active: true
    }
];

export class CatalogoServicio implements ICatalogo {
    private baseUrl = 'http://localhost:8001/catalog';

    async getCategorias(): Promise<Category[]> {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            if (!response.ok) {
                throw new Error('Error al obtener categorías');
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching categories from backend, using mocks:', e);
            return MOCK_CATEGORIES;
        }
    }

    async getTshirts(categoriaId?: string, search?: string): Promise<Tshirt[]> {
        if (categoriaId === 'favoritos') {
            return this.getFavorites(search);
        }
        try {
            const baseTshirts = await this.getBaseTshirts(categoriaId, search);
            const presetDesigns = await this.getDiseñosPredeterminados();
            
            if (baseTshirts.length === 0 || presetDesigns.length === 0) {
                return [];
            }
            
            const combined: Tshirt[] = [];
            baseTshirts.forEach((base, index) => {
                const design = presetDesigns[index % presetDesigns.length];
                combined.push({
                    id: `${design.id}__${base.id}`,
                    categoryid: base.categoryid,
                    name: `${base.name} con estampado ${design.name}`,
                    description: base.description || `Polera de tipo ${base.name} con el estampado premium ${design.name}.`,
                    base_price: base.base_price,
                    is_active: base.is_active && design.is_active,
                    image_url: design.image_url
                });
            });
            
            return combined;
        } catch (e) {
            console.error('Error fetching/mapping preset designs:', e);
            const mockBaseTshirts = MOCK_TSHIRTS.filter(t => !categoriaId || t.categoryid === categoriaId);
            const mockDesigns = [
                { id: "44444444-0000-0000-0000-000000000001", name: "Llamas geométricas", image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80", is_active: true },
                { id: "44444444-0000-0000-0000-000000000002", name: "Abstracto azul", image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80", is_active: true },
                { id: "44444444-0000-0000-0000-000000000003", name: "Montañas minimalistas", image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80", is_active: true },
                { id: "44444444-0000-0000-0000-000000000004", name: "Floral vintage", image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80", is_active: true },
                { id: "44444444-0000-0000-0000-000000000005", name: "Calavera urbana", image_url: "https://images.unsplash.com/photo-1575995872537-3793d29d972c?w=500&auto=format&fit=crop&q=80", is_active: true }
            ];
            
            const combined: Tshirt[] = [];
            mockBaseTshirts.forEach((base, index) => {
                const design = mockDesigns[index % mockDesigns.length];
                combined.push({
                    id: `${design.id}__${base.id}`,
                    categoryid: base.categoryid,
                    name: `${base.name} con estampado ${design.name}`,
                    description: base.description || `Polera de tipo ${base.name} con el estampado premium ${design.name}.`,
                    base_price: base.base_price,
                    is_active: base.is_active && design.is_active,
                    image_url: design.image_url
                });
            });
            return combined;
        }
    }

    async getTshirtSizes(tshirtId: string): Promise<TshirtSize[]> {
        return [];
    }

    async getDiseñosPredeterminados(): Promise<PresetDesing[]> {
        try {
            const response = await fetch(`${this.baseUrl}/preset-designs`);
            if (!response.ok) {
                throw new Error('Error al obtener diseños predeterminados');
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching preset designs from backend:', e);
            return [];
        }
    }

    async toggleFavorite(tshirtId: string): Promise<boolean> {
        try {
            const designId = tshirtId.includes('__') ? tshirtId.split('__')[0] : tshirtId;
            const response = await fetch(`${this.baseUrl}/favorites/toggle/${designId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Error al alternar favorito');
            }
            const data = await response.json();
            return data.favorited;
        } catch (e) {
            console.error('Error toggling favorite on backend:', e);
            return false;
        }
    }

    async getFavorites(search?: string): Promise<Tshirt[]> {
        try {
            const url = new URL(`${this.baseUrl}/favorites`);
            if (search && search.trim()) {
                url.searchParams.append('search', search.trim());
            }
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Error al obtener favoritos');
            }
            const favTshirts = await response.json();
            
            const baseTshirts = await this.getBaseTshirts();
            const defaultBase = baseTshirts.length > 0 ? baseTshirts[0] : MOCK_TSHIRTS[0];
            
            return favTshirts.map((t: any) => {
                const designId = t.id;
                return {
                    id: `${designId}__${defaultBase.id}`,
                    categoryid: t.categoryid,
                    name: `${defaultBase.name} con estampado ${t.name}`,
                    description: t.description,
                    base_price: defaultBase.base_price,
                    is_active: t.is_active,
                    image_url: t.image_url
                };
            });
        } catch (e) {
            console.error('Error fetching favorites from backend, using mocks:', e);
            return [];
        }
    }

    async getBaseTshirts(categoriaId?: string, search?: string): Promise<Tshirt[]> {
        try {
            const url = new URL(`${this.baseUrl}/tshirts`);
            if (categoriaId) {
                url.searchParams.append('category_id', categoriaId);
            }
            if (search && search.trim()) {
                url.searchParams.append('search', search.trim());
            }
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Error al obtener poleras base');
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching base tshirts:', e);
            let list = MOCK_TSHIRTS;
            if (categoriaId) {
                list = list.filter(tshirt => tshirt.categoryid === categoriaId);
            }
            if (search && search.trim()) {
                const term = search.toLowerCase();
                list = list.filter(tshirt => tshirt.name.toLowerCase().includes(term) || tshirt.description.toLowerCase().includes(term));
            }
            return list;
        }
    }

    async uploadDesign(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseUrl}/upload-design`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || 'Error al subir diseño propio.');
        }
        
        const data = await response.json();
        return data.image_url;
    }
}