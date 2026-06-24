export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Tshirt {
    id: string;
    categoryid: string;
    name: string;
    description: string;
    base_price: string;
    is_active: boolean;
    image_url?: string;
}

export interface TshirtSize {
    id: string;
    tshirt_id: string;
    size_label: string;
    is_available: boolean;
}

export interface PresetDesing {
    id: string;
    name: string;
    is_active: boolean;
    image: string;
}