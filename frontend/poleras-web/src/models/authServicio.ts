// src/models/authServicio.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { LoginRequest, TokenResponse, UserResponse, RegisterRequest } from './types';

// La URL base debe venir de variables de entorno en producción (VITE_API_BASE_URL)
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token en cada petición saliente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para rotación automática de tokens (Exigencia de rúbrica)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Petición al endpoint de refresh en FastAPI
        const { data } = await axios.post<TokenResponse>(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        // Guardar nuevos tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Actualizar header y reintentar petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (expiró o es inválido), limpiar y mandar al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authServicio = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post('/auth/register', data);
  },
};