
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function Login() {
  const navigate = useNavigate();

  const { login, autenticado, loading } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setEnviando(true);

    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return null;

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.header}>
          <LogIn size={32} />
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de nuevo a COMPUTECH</p>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Ingresá tu contraseña"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={enviando}
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>

        </form>

        <p className={styles.footer}>
          ¿No tenés una cuenta?{' '}
          <Link to="/registro">Registrate</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
