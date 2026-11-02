
import { useEffect, useState } from 'react';

import {
  ClipboardList,
  Eye,
  ArrowRight,
  X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { pedidoService } from '../services/pedidoService';

import styles from './Pedidos.module.css';

const SIGUIENTE_ESTADO = {
  pendiente: 'preparando',
  pagado: 'preparando',
  preparando: 'enviado',
  enviado: 'entregado'
};

const ETIQUETAS = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const ACCIONES = {
  preparando: 'Comenzar preparación',
  enviado: 'Marcar como enviado',
  entregado: 'Marcar como entregado'
};

function Pedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState('');

  const [paginacion, setPaginacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardandoId, setGuardandoId] = useState(null);
  const [version, setVersion] = useState(0);

  // Obtener los pedidos
  useEffect(() => {
    let activo = true;

    const cargarPedidos = async () => {
      setLoading(true);
      setError('');

      try {
        const respuesta = await pedidoService.obtenerPedidos(
          token,
          pagina,
          estadoFiltro
        );

        // Admite arreglo directo o respuesta paginada.
        const datos = respuesta.data;
        const lista = Array.isArray(datos)
          ? datos
          : datos?.docs || datos?.ordenes || [];

        if (activo) {
          setPedidos(lista);
          setPaginacion(respuesta.pagination || datos || {});
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setLoading(false);
      }
    };

    if (token) cargarPedidos();

    return () => {
      activo = false;
    };
  }, [token, pagina, estadoFiltro, version]);

  // Consultar el detalle completo
  const verDetalle = async (id) => {
    setCargandoDetalle(true);
    setError('');

    try {
      const respuesta = await pedidoService.obtenerPedidoPorId(
        id,
        token
      );

      setDetalle(respuesta.data || respuesta.orden);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Avanzar estado de un pedido
  const avanzarEstado = async (pedido) => {
    const siguiente = SIGUIENTE_ESTADO[pedido.estado];

    if (!siguiente) return;

    setGuardandoId(pedido._id);
    setError('');
    setMensaje('');

    try {
      await pedidoService.actualizarEstado(
        pedido._id,
        siguiente,
        token
      );

      setMensaje(
        `Pedido actualizado a "${ETIQUETAS[siguiente]}".`
      );

      // Actualizar la tabla
      setVersion((prev) => prev + 1);

      // Si el detalle está abierto, actualizar su estado.
      setDetalle((actual) =>
        actual?._id === pedido._id
          ? { ...actual, estado: siguiente }
          : actual
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  };

  const formatearPrecio = (valor) =>
    Number(valor || 0).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });

  const formatearFecha = (fecha) =>
    fecha
      ? new Date(fecha).toLocaleDateString('es-AR')
      : 'Sin fecha';

  const obtenerCliente = (pedido) =>
    pedido.usuario?.nombre ||
    pedido.cliente?.nombre ||
    'Cliente no disponible';

  const itemsDetalle = detalle?.items ||
    detalle?.productos || [];

  return (
    <div className={styles.container}>

      {/* ENCABEZADO */}
      <header className={styles.header}>
        <span className={styles.subtitle}>
          PANEL DE EMPLEADOS
        </span>

        <h1>
          <ClipboardList size={30} />
          Gestión de pedidos
        </h1>

        <p>
          Consultá las órdenes y actualizá su estado.
        </p>
      </header>

      {/* FILTROS */}
      <div className={styles.filters}>
        <label htmlFor="estado">
          Filtrar por estado
        </label>

        <select
          id="estado"
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos los pedidos</option>

          {Object.entries(ETIQUETAS).map(([valor, nombre]) => (
            <option key={valor} value={valor}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

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
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Cargando pedidos...</td>
              </tr>
            ) : pedidos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  No se encontraron pedidos.
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => {
                const siguiente =
                  SIGUIENTE_ESTADO[pedido.estado];

                return (
                  <tr key={pedido._id}>
                    <td className={styles.orderId}>
                      #{pedido._id.slice(-8).toUpperCase()}
                    </td>

                    <td>
                      {formatearFecha(pedido.createdAt)}
                    </td>

                    <td>{obtenerCliente(pedido)}</td>

                    <td>
                      {formatearPrecio(pedido.total)}
                    </td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[pedido.estado] || ''
                        }`}
                      >
                        {ETIQUETAS[pedido.estado] ||
                          pedido.estado}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.detailButton}
                          disabled={cargandoDetalle}
                          onClick={() =>
                            verDetalle(pedido._id)
                          }
                        >
                          <Eye size={16} />
                          Detalle
                        </button>

                        {siguiente && (
                          <button
                            type="button"
                            className={styles.advanceButton}
                            disabled={guardandoId !== null}
                            onClick={() =>
                              avanzarEstado(pedido)
                            }
                          >
                            {guardandoId === pedido._id
                              ? 'Guardando...'
                              : ACCIONES[siguiente]}

                            <ArrowRight size={16} />
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
            loading ||
            guardandoId !== null ||
            !paginacion.hasPrevPage
          }
          onClick={() => {
            setLoading(true);
            setPagina((prev) => prev - 1);
          }}
        >
          Anterior
        </button>

        <span>
          Página {paginacion.currentPage || pagina}
          {' '}de {paginacion.totalPages || 1}
        </span>

        <button
          type="button"
          disabled={
            loading ||
            guardandoId !== null ||
            !paginacion.hasNextPage
          }
          onClick={() => {
            setLoading(true);
            setPagina((prev) => prev + 1);
          }}
        >
          Siguiente
        </button>
      </div>

      {/* DETALLE DEL PEDIDO */}
      {detalle && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDetalle(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="titulo-detalle">
                Pedido #{detalle._id.slice(-8).toUpperCase()}
              </h2>

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setDetalle(null)}
              >
                <X size={21} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <p>
                <strong>Cliente:</strong>{' '}
                {obtenerCliente(detalle)}
              </p>

              <p>
                <strong>Fecha:</strong>{' '}
                {formatearFecha(detalle.createdAt)}
              </p>

              <p>
                <strong>Estado:</strong>{' '}
                {ETIQUETAS[detalle.estado] ||
                  detalle.estado}
              </p>

              <h3>Productos</h3>

              {itemsDetalle.length === 0 ? (
                <p>No hay detalles de productos disponibles.</p>
              ) : (
                <ul className={styles.itemList}>
                  {itemsDetalle.map((item, index) => (
                    <li key={item._id || index}>
                      <span>
                        {item.producto?.nombre ||
                          item.nombre ||
                          'Producto'}
                        {' '}x {item.cantidad}
                      </span>

                      <strong>
                        {formatearPrecio(
                          item.subtotal ??
                          (item.precioUnitario ??
                            item.precio ?? 0) *
                            item.cantidad
                        )}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.modalTotal}>
                <span>Total</span>
                <strong>
                  {formatearPrecio(detalle.total)}
                </strong>
              </div>

              {detalle.direccionEnvio && (
                <div className={styles.address}>
                  <h3>Dirección de envío</h3>

                  <p>
                    {detalle.direccionEnvio.calle}
                    {', '}
                    {detalle.direccionEnvio.ciudad}
                    {', '}
                    {detalle.direccionEnvio.provincia}
                    {' '}
                    {detalle.direccionEnvio.codigoPostal}
                  </p>
                </div>
              )}

              {SIGUIENTE_ESTADO[detalle.estado] && (
                <button
                  type="button"
                  className={styles.advanceButton}
                  disabled={guardandoId !== null}
                  onClick={() => avanzarEstado(detalle)}
                >
                  {ACCIONES[
                    SIGUIENTE_ESTADO[detalle.estado]
                  ]}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

export default Pedidos;
