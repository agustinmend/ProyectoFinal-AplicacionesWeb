import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../context/AuthContext';
import './Register.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  // Consumo del estado global
  const { register, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login'); // Tras registro exitoso, forzamos login
    } catch (err) {
      // El AuthContext ya maneja el seteo de errores
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/'); // Si se registra/loguea con Google, va directo al catálogo
      } catch (err) {
        console.error("Fallo la validación de Google con el backend");
      }
    },
    onError: () => console.error('Fallo el popup de Google'),
  });

  return (
    <main className="register">
      <div className="register__card">
        <header className="register__header">
          <h1 className="register__title">Crear Cuenta</h1>
          <p className="register__subtitle">Regístrate para guardar tus datos y compras.</p>
        </header>

        {error && <div className="register__error">{error}</div>}

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__group">
            <label htmlFor="full_name" className="register__label">Nombre completo</label>
            <input
              type="text"
              id="full_name"
              className="register__input"
              placeholder="Ej: Juan Pérez"
              onChange={handleChange}
              required
            />
          </div>

          <div className="register__group">
            <label htmlFor="email" className="register__label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="register__input"
              placeholder="tu@correo.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="register__group">
            <label htmlFor="password" className="register__label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="register__input"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register__submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <div className="register__divider">
          <span className="register__divider-text">O continúa con</span>
        </div>

        <button 
          type="button" 
          className="register__social"
          onClick={() => handleGoogleSuccess()}
          disabled={isLoading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="register__social-icon" />
          {isLoading ? 'Conectando...' : 'Google'}
        </button>

        <footer className="register__footer">
          <p className="register__footer-text">
            ¿Ya tienes cuenta? <Link to="/login" className="register__link">Inicia sesión</Link>
          </p>
        </footer>
      </div>
    </main>
  );
};