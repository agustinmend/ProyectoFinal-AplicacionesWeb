import { useState, useEffect } from 'react';
import type { Category, Tshirt } from '../models/types';
import { CatalogoServicio } from '../models/catalogoServicio';

export function useCatalog(searchQuery: string, isAuthenticated: boolean) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [tshirts, setTshirts] = useState<Tshirt[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const catalogoServicio = new CatalogoServicio();

    // 1. Cargar las categorías al inicio
    useEffect(() => {
        catalogoServicio.getCategorias()
            .then((data) => {
                setCategories(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    // 1.5. Cargar los favoritos al inicio o cuando cambie la sesión
    useEffect(() => {
        if (!isAuthenticated) {
            setFavoriteIds([]);
            return;
        }
        catalogoServicio.getFavorites()
            .then((data) => {
                setFavoriteIds(data.map(item => item.id.split('__')[0]));
            })
            .catch((err) => {
                console.error('Error loading initial favorites:', err);
            });
    }, [isAuthenticated]);

    // 2. Debounce del query de búsqueda (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    // 3. Cargar las poleras según la categoría y el query con debounce
    useEffect(() => {
        setLoading(true);
        setError(null);
        catalogoServicio.getTshirts(selectedCategoryId, debouncedSearch)
            .then((data) => {
                setTshirts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Error al conectar con el servidor.');
                setLoading(false);
            });
    }, [selectedCategoryId, debouncedSearch]);

    // 3.5. Si estamos en la categoría favoritos y se remueve un elemento localmente, quitarlo de la lista inmediatamente
    useEffect(() => {
        if (selectedCategoryId === 'favoritos') {
            setTshirts(prev => prev.filter(t => favoriteIds.includes(t.id.split('__')[0])));
        }
    }, [favoriteIds, selectedCategoryId]);

    // 4. Cambiar la categoría activa
    const selectCategory = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
    };

    // 5. Alternar favorito (optimista)
    const toggleFavorite = async (tshirtId: string) => {
        const designId = tshirtId.includes('__') ? tshirtId.split('__')[0] : tshirtId;
        const isFav = favoriteIds.includes(designId);
        if (isFav) {
            setFavoriteIds(prev => prev.filter(id => id !== designId));
        } else {
            setFavoriteIds(prev => [...prev, designId]);
        }
        
        const success = await catalogoServicio.toggleFavorite(tshirtId);
        if (success !== !isFav) {
            // Sincronizar si el estado real difiere de la estimación optimista
            if (success) {
                setFavoriteIds(prev => prev.includes(designId) ? prev : [...prev, designId]);
            } else {
                setFavoriteIds(prev => prev.filter(id => id !== designId));
            }
        }
    };

    return {
        categories,
        selectedCategoryId,
        tshirts,
        favoriteIds,
        loading,
        error,
        selectCategory,
        toggleFavorite,
    };
}
