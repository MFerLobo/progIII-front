
import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { inventarioService } from '../services/inventarioService';

import styles from './CrearProductoModal.module.css';

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  sku: '',
  precio: '',
  stock: '0',
  categoria: '',
  marca: '',
  garantiaMeses: '0'
};

function CrearProductoModal({ onCerrar, onCreado }) {
  const { token } = useAuth();

  const [form, setForm] = useState(FORM_INICIAL);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarOpciones = async () => {
      try {
        const [resCategorias, resMarcas] = await Promise.all([
          inventarioService.obtenerCategorias(),
          inventarioService.obtenerMarcas()
        ]);

        if (!activo) return;

        setCategorias(resCategorias.data || []);
        setMarcas(resMarcas.data || []);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarOpciones();

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((actual) => ({
      ...actual,
      [name]: value
    }));
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const precio = Number(form.precio);
    const stock = Number(form.stock);
    const garantiaMeses = Number(form.garantiaMeses);

    if (
      !form.nombre.trim() ||
      !form.sku.trim() ||
      !form.categoria ||
      !form.marca ||
      form.precio.trim() === '' ||
      !Number.isFinite(precio) ||
      precio < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(garantiaMeses) ||
      garantiaMeses < 0
    ) {
      setError('Revisá los campos del producto.');
      return;
    }

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      sku: form.sku.trim(),
      precio,
      stock,
      categoria: form.categoria,
      marca: form.marca,
      garantiaMeses
    };

    setGuardando(true);
    setError('');

    try {
      await inventarioService.crearProducto(datos, token);
      onCreado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-crear-producto"
      >
        <header className={styles.header}>
          <h2 id="titulo-crear-producto">
            Nuevo producto
          </h2>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={21} />
          </button>
        </header>

        <form onSubmit={guardarProducto} className={styles.form}>
          <label>
            Nombre *
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            SKU *
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="CPU-AMD-001"
              required
            />
          </label>

          <label className={styles.fullWidth}>
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Precio (ARS) *
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stock *
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Categoría *
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">Seleccionar categoría</option>

              {categorias.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Marca *
            <select
              name="marca"
              value={form.marca}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">Seleccionar marca</option>

              {marcas.map((marca) => (
                <option key={marca._id} value={marca._id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.fullWidth}>
            Garantía (meses)
            <input
              name="garantiaMeses"
              type="number"
              min="0"
              step="1"
              value={form.garantiaMeses}
              onChange={handleChange}
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelar}
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.guardar}
              disabled={guardando || loading}
            >
              <Save size={17} />
              {guardando ? 'Guardando...' : 'Crear producto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CrearProductoModal;
