
import { useEffect, useState } from 'react';
import {
  Search,
  Pencil,
  Save,
  X,
  Boxes
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { inventarioService } from '../services/inventarioService';

import styles from './Inventario.module.css';

function Inventario() {
  const { token } = useAuth();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [terminoActivo, setTerminoActivo] = useState('');
  const [pagina, setPagina] = useState(1);

  const [paginacion, setPaginacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    precio: '',
    stock: ''
  });

  const cargarProductos = async () => {
    setLoading(true);
    setError('');

    try {
      const respuesta = await inventarioService.obtenerProductos(
        pagina,
        terminoActivo
      );

      setProductos(respuesta.data);
      setPaginacion(respuesta.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;

    inventarioService
      .obtenerProductos(pagina, terminoActivo)
      .then((respuesta) => {
        if (activo) {
          setProductos(respuesta.data);
          setPaginacion(respuesta.pagination);
          setError('');
        }
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [pagina, terminoActivo]);

  // Buscar productos
  const handleBuscar = (e) => {
    e.preventDefault();
    setLoading(true);
    setPagina(1);
    setTerminoActivo(busqueda.trim());
  };

  // Comenzar edición
  const editarProducto = (producto) => {
    setEditandoId(producto._id);

    setForm({
      precio: String(producto.precio),
      stock: String(producto.stock)
    });

    setError('');
    setMensaje('');
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  // Guardar los cambios
  const guardarCambios = async (producto) => {
    const nuevoPrecio = Number(form.precio);
    const nuevoStock = Number(form.stock);

    if (
      form.precio.trim() === '' ||
      form.stock.trim() === '' ||
      !Number.isFinite(nuevoPrecio) ||
      nuevoPrecio < 0 ||
      !Number.isInteger(nuevoStock) ||
      nuevoStock < 0
    ) {
      setError('Ingresá un precio y stock válidos.');
      return;
    }

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      // Modificar solo los valores que cambiaron.
      if (nuevoPrecio !== producto.precio) {
        await inventarioService.actualizarPrecio(
          producto._id,
          nuevoPrecio,
          token
        );
      }

      if (nuevoStock !== producto.stock) {
        await inventarioService.actualizarStock(
          producto._id,
          nuevoStock,
          token
        );
      }

      setEditandoId(null);
      setMensaje('Producto actualizado correctamente.');

      await cargarProductos();
    } catch (err) {
      setError(
        `${err.message}. Revisá los valores actuales del producto.`
      );
      await cargarProductos();
    } finally {
      setGuardando(false);
    }
  };

  const formatearPrecio = (precio) =>
    Number(precio).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    });

  return (
    <div className={styles.container}>

      {/* ENCABEZADO */}
      <header className={styles.header}>
        <div>
          <span className={styles.subtitle}>
            PANEL DE EMPLEADOS
          </span>
          <h1>
            <Boxes size={30} />
            Gestión de inventario
          </h1>
          <p>
            Consultá y modificá precios y existencias.
          </p>
        </div>
      </header>

      {/* BUSCADOR */}
      <form
        className={styles.searchForm}
        onSubmit={handleBuscar}
      >
        <div className={styles.searchBox}>
          <Search size={19} />

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, SKU o descripción..."
          />
        </div>

        <button type="submit">
          Buscar
        </button>
      </form>

      {/* MENSAJES */}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {mensaje && (
        <p className={styles.success} role="status">
          {mensaje}
        </p>
      )}

      {/* TABLA */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  Cargando inventario...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productos.map((producto) => {
                const editando =
                  editandoId === producto._id;

                return (
                  <tr key={producto._id}>
                    <td>
                      <div className={styles.productInfo}>
                        <strong>{producto.nombre}</strong>
                        <small>{producto.sku}</small>
                      </div>
                    </td>

                    <td>
                      {producto.categoria?.nombre || 'Sin categoría'}
                    </td>

                    <td>
                      {producto.marca?.nombre || 'Sin marca'}
                    </td>

                    <td>
                      {editando ? (
                        <input
                          className={styles.editInput}
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.precio}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              precio: e.target.value
                            })
                          }
                        />
                      ) : (
                        formatearPrecio(producto.precio)
                      )}
                    </td>

                    <td>
                      {editando ? (
                        <input
                          className={styles.editInput}
                          type="number"
                          min="0"
                          step="1"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              stock: e.target.value
                            })
                          }
                        />
                      ) : (
                        <span
                          className={
                            producto.stock === 0
                              ? styles.noStock
                              : styles.stock
                          }
                        >
                          {producto.stock}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className={styles.actions}>
                        {editando ? (
                          <>
                            <button
                              type="button"
                              className={styles.saveButton}
                              disabled={guardando}
                              onClick={() =>
                                guardarCambios(producto)
                              }
                              title="Guardar cambios"
                            >
                              <Save size={17} />
                              Guardar
                            </button>

                            <button
                              type="button"
                              className={styles.cancelButton}
                              disabled={guardando}
                              onClick={cancelarEdicion}
                              title="Cancelar"
                            >
                              <X size={17} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={styles.editButton}
                            disabled={editandoId !== null}
                            onClick={() =>
                              editarProducto(producto)
                            }
                          >
                            <Pencil size={17} />
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className={styles.pagination}>
        <button
          type="button"
          disabled={
            !paginacion.hasPrevPage ||
            loading ||
            guardando ||
            editandoId !== null
          }
          onClick={() => {
            setLoading(true);
            setPagina((prev) => prev - 1);
          }}
        >
          Anterior
        </button>

        <span>
          Página {paginacion.currentPage || pagina} de{' '}
          {paginacion.totalPages || 1}
        </span>

        <button
          type="button"
          disabled={
            !paginacion.hasNextPage ||
            loading ||
            guardando ||
            editandoId !== null
          }
          onClick={() => {
            setLoading(true);
            setPagina((prev) => prev + 1);
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Inventario;
