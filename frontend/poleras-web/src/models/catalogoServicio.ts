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
    async getCategorias(): Promise<Category[]> {
        return MOCK_CATEGORIES;
    }

    async getTshirts(categoriaId?: string): Promise<Tshirt[]> {
        if (categoriaId) {
            return MOCK_TSHIRTS.filter(tshirt => tshirt.categoryid === categoriaId);
        }
        return MOCK_TSHIRTS;
    }

    async getTshirtSizes(tshirtId: string): Promise<TshirtSize[]> {
        return [];
    }

    async getDiseñosPredeterminados(): Promise<PresetDesing[]> {
        return [];
    }
}