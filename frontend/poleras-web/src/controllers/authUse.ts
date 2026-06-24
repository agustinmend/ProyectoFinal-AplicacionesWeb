// src/controllers/authUse.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authServicio } from '../models/authServicio';
import type { LoginRequest, UserResponse, RegisterRequest } from '../models/types';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener tokens
      const tokens = await authServicio.login(credentials);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // 2. Obtener perfil del usuario
      const profile = await authServicio.getProfile();
      setUser(profile);

      // 3. Redirigir según el rol (Preparando terreno para el Módulo Admin)
      if (profile.role === 'administrador') {
        navigate('/admin'); // Ruta futura
      } else {
        navigate('/'); // Catálogo
      }
    } catch (err: any) {
      // Manejo de errores coherente (Exigencia de rúbrica)
      if (err.response?.status >= 500) {
        setError('Error interno del servidor. Por favor, intenta de nuevo más tarde.');
      } else if (err.response?.data?.detail) {
        // Errores de validación de FastAPI (ej. Credenciales incorrectas)
        setError(err.response.data.detail);
      } else {
        setError('Ocurrió un error al intentar iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authServicio.logout();
    setUser(null);
    navigate('/login');
  };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            await authServicio.register(data);
            navigate('/login');
        } catch (err: any) {
        if (err.response?.status === 400) {
            setError('El correo ya está registrado.');
        } else {
            setError('Error al crear la cuenta. Inténtalo de nuevo.');
        }
        } finally {
        setIsLoading(false);
        }
  };

  return { register, login, logout, user, isLoading, error };
};