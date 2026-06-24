import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../controllers/authUse';
import './Register.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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

        <button type="button" className="register__social">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="register__social-icon" />
          Google
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