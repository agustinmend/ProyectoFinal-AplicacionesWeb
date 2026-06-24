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

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: 'cliente' | 'moderador' | 'administrador';
  is_active: boolean;
}