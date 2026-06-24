import React, { useState } from 'react';
import './Login.css';

// TODO: Importar tu hook controlador cuando lo creemos
// import { useAuth } from '../../../controllers/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando credenciales al controlador:', { email, password });
  };

  const handleGoogleLogin = () => {
    console.log('Disparando flujo de Google OAuth');
  };

  return (
    <main className="login">
      <section className="login__illustration-container">
        <div style={{ width: '400px', height: '400px', backgroundColor: '#e0e0e0', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Placeholder Ilustración
        </div>
      </section>

      <section className="login__form-wrapper">
        <header className="login__header">
          <h1 className="login__title">Iniciar sesión</h1>
          <p className="login__subtitle">
            ¿No tienes una cuenta? <a href="/registro" className="login__link">Regístrate aquí</a>
          </p>
        </header>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__input-group">
            <label htmlFor="email" className="login__label">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="login__input"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login__input-group">
            <div className="login__input-header">
              <label htmlFor="password" className="login__label">Contraseña</label>
              <a href="/recuperar" className="login__forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
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

          <button type="submit" className="login__submit-btn">
            Ingresar
          </button>
        </form>

        <div className="login__divider">o continuar con</div>

        <button type="button" className="login__social-btn" onClick={handleGoogleLogin}>
          {}
          <svg className="login__social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
      </section>
    </main>
  );
};