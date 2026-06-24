import type { Category, PresetDesing, Tshirt, TshirtSize } from "./types";
import { type ICatalogo } from "./catalogo";

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
            console.error('Error fetching categories from backend:', e);
            return [];
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
                
                // Mostrar únicamente cuando el tipo de polera base y el estampado están activos
                if (base.is_active && design.is_active) {
                    combined.push({
                        id: `${design.id}__${base.id}`,
                        categoryid: base.categoryid,
                        name: `${base.name} con estampado ${design.name}`,
                        description: base.description || `Polera de tipo ${base.name} con el estampado premium ${design.name}.`,
                        base_price: base.base_price,
                        is_active: true,
                        image_url: design.image_url
                    });
                }
            });
            
            return combined;
        } catch (e) {
            console.error('Error fetching/mapping preset designs:', e);
            return [];
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
            if (baseTshirts.length === 0) {
                return [];
            }
            const defaultBase = baseTshirts[0];
            
            const list: Tshirt[] = [];
            favTshirts.forEach((t: any) => {
                const designId = t.id;
                // Solo mostrar si el diseño favorito está activo
                if (t.is_active) {
                    list.push({
                        id: `${designId}__${defaultBase.id}`,
                        categoryid: t.categoryid,
                        name: `${defaultBase.name} con estampado ${t.name}`,
                        description: t.description,
                        base_price: defaultBase.base_price,
                        is_active: t.is_active,
                        image_url: t.image_url
                    });
                }
            });
            return list;
        } catch (e) {
            console.error('Error fetching favorites from backend:', e);
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
            console.error('Error fetching base tshirts from backend:', e);
            return [];
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