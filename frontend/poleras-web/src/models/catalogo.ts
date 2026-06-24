import type { Category, Tshirt, TshirtSize, PresetDesing } from "./types";

export interface ICatalogo {
    getCategorias(): Promise<Category[]>;
    getTshirts(categoriaId?: string, search?: string): Promise<Tshirt[]>;
    getTshirtSizes(tshirtId: string): Promise<TshirtSize[]>;
    getDiseñosPredeterminados(): Promise<PresetDesing[]>;
}

