import { useState, useEffect } from 'react';
import type { Category, Tshirt } from '../models/types';
import { CatalogoServicio } from '../models/catalogoServicio';

export function useCatalog() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [tshirts, setTshirts] = useState<Tshirt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);

    const catalogoServicio = new CatalogoServicio();

    // 1. Cargar las categorías al inicio
    useEffect(() => {
        catalogoServicio.getCategorias().then((data) => {
            setCategories(data);
        });
    }, []);

    // 2. Cargar y filtrar las poleras según la categoría seleccionada
    useEffect(() => {
        setLoading(true);
        catalogoServicio.getTshirts(selectedCategoryId).then((data) => {
            setTshirts(data);
            setLoading(false);
        });
    }, [selectedCategoryId]);

    // 3. Cambiar la categoría activa
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
