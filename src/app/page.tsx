/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // ✅ Si ya hay sesión activa, mandamos directo al dashboard
  useEffect(() => {
    const logged = localStorage.getItem('loggedIn');
    if (logged === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message);
      } else {
        // ✅ Guardamos usuario y sesión activa
        localStorage.setItem('usuario', data.user.usuario || data.user.correo);
        localStorage.setItem('loggedIn', 'true');

        router.push('/dashboard');
      }
    } catch (err) {
      setError('❌ Error en la conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar sesión</h1>
        <p className="subtitle">
          Usa <span>usuario o correo</span> y tu <span>contraseña</span>
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="identifier">Usuario o correo</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ej: juan@mail.com"
            autoComplete="username"
          />

          <div className="password-label">
            <label htmlFor="password">Contraseña</label>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
          />

          <div className="options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </label>
            <a href="#" className="forgot">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="footer">Bienvenido al sistema de la Gasolinera 🚛⛽</p>
      </div>
    </div>
  );
}
