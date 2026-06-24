import type { Category, PresetDesing, Tshirt, TshirtSize } from "./types";
import { type ICatalogo } from "./catalogo";
import { apiClient } from "./authServicio";

export class CatalogoServicio implements ICatalogo {
    async getCategorias(): Promise<Category[]> {
        try {
            const response = await apiClient.get<Category[]>('/catalog/categories');
            return response.data;
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
            const response = await apiClient.get<PresetDesing[]>('/catalog/preset-designs');
            return response.data;
        } catch (e) {
            console.error('Error fetching preset designs from backend:', e);
            return [];
        }
    }

    async toggleFavorite(tshirtId: string): Promise<boolean> {
        try {
            const designId = tshirtId.includes('__') ? tshirtId.split('__')[0] : tshirtId;
            const response = await apiClient.post<{ favorited: boolean }>(`/catalog/favorites/toggle/${designId}`);
            return response.data.favorited;
        } catch (e) {
            console.error('Error toggling favorite on backend:', e);
            return false;
        }
    }

    async getFavorites(search?: string): Promise<Tshirt[]> {
        try {
            const params: any = {};
            if (search && search.trim()) {
                params.search = search.trim();
            }
            const response = await apiClient.get<any[]>('/catalog/favorites', { params });
            const favTshirts = response.data;
            
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
            const params: any = {};
            if (categoriaId) {
                params.category_id = categoriaId;
            }
            if (search && search.trim()) {
                params.search = search.trim();
            }
            const response = await apiClient.get<Tshirt[]>('/catalog/tshirts', { params });
            return response.data;
        } catch (e) {
            console.error('Error fetching base tshirts from backend:', e);
            return [];
        }
    }

    async uploadDesign(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post<{ image_url: string }>('/catalog/upload-design', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data.image_url;
    }
}