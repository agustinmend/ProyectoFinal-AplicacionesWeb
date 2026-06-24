import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../context/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Extraemos loginWithGoogle del contexto global
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // El error ya lo gestiona el estado global y se refleja en la UI
    }
  };

  // Implementación estricta del flujo de Google OAuth
  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/'); // Redirige al catálogo tras autenticación exitosa
      } catch (err) {
        console.error("Fallo la validación del token de Google con el backend", err);
      }
    },
    onError: () => console.error('Fallo la autenticación con el popup de Google'),
  });

  return (
    <main className="login">
      <div className="login__card">
        <header className="login__header">
          <h1 className="login__title">Ingresa a tu cuenta</h1>
          <p className="login__subtitle">¡Bienvenido de vuelta! Por favor ingresa tus datos.</p>
        </header>

        {error && <div className="login__error">{error}</div>}

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__group">
            <label htmlFor="email" className="login__label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="login__input"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login__group">
            <label htmlFor="password" className="login__label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="login__input"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login__options">
            <Link to="/recuperar" className="login__forgot">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="login__submit" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login__divider">
          <span className="login__divider-text">o</span>
        </div>

        <button 
          type="button" 
          className="login__social" 
          onClick={() => handleGoogleSuccess()}
          disabled={isLoading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="login__social-icon" style={{ width: '18px' }} />
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <footer className="login__footer">
          <p className="login__footer-text">
            ¿No tienes una cuenta? <Link to="/registro" className="login__link">Regístrate</Link>
          </p>
        </footer>
      </div>
    </main>
  );
};