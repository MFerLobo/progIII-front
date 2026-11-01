
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function Registro() {
  const navigate = useNavigate();

  const { registro, autenticado, loading } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    telefono: '',
    calle: '',
    ciudad: '',
    provincia: '',
    codigoPostal: ''
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

    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const datos = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password
    };

    if (form.telefono.trim()) {
      datos.telefono = form.telefono.trim();
    }

    const direccion = {
      calle: form.calle.trim(),
      ciudad: form.ciudad.trim(),
      provincia: form.provincia.trim(),
      codigoPostal: form.codigoPostal.trim()
    };

    if (Object.values(direccion).some(Boolean)) {
      datos.direccion = direccion;
    }

    setEnviando(true);

    try {
      await registro(datos);
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
          <UserPlus size={32} />
          <h1>Crear cuenta</h1>
          <p>Registrate como cliente de COMPUTECH</p>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmarPassword">
              Confirmar contraseña
            </label>
            <input
              id="confirmarPassword"
              type="password"
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="telefono">
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <h2 className={styles.sectionTitle}>
            Dirección (opcional)
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="calle">Calle y altura</label>
            <input
              id="calle"
              name="calle"
              value={form.calle}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="provincia">Provincia</label>
              <input
                id="provincia"
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="codigoPostal">Código postal</label>
            <input
              id="codigoPostal"
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={handleChange}
              autoComplete="postal-code"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={enviando}
          >
            {enviando ? 'Registrando...' : 'Crear cuenta'}
          </button>

        </form>

        <p className={styles.footer}>
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login">Iniciar sesión</Link>
        </p>

      </div>
    </div>
  );
}

export default Registro;
