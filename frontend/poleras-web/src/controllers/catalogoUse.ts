import { useState, useEffect } from 'react';
import type { Category, Tshirt } from '../models/types';
import { CatalogoServicio } from '../models/catalogoServicio';

export function useCatalog(searchQuery: string) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [tshirts, setTshirts] = useState<Tshirt[]>([]);
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

    // 4. Cambiar la categoría activa
    const selectCategory = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
    };

    return {
        categories,
        selectedCategoryId,
        tshirts,
        loading,
        error,
        selectCategory,
    };
}
