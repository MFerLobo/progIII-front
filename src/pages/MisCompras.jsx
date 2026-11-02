
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Package,
  Eye,
  X,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { compraService } from '../services/compraService';

import styles from './MisCompras.module.css';

const ESTADOS = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const formatearPrecio = (valor) =>
  Number(valor ?? 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS'
  });

const formatearFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Sin fecha';

function MisCompras() {
  const { token } = useAuth();

  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarCompras = async () => {
      setLoading(true);
      setError('');

      try {
        const respuesta = await compraService.obtenerMisCompras(
          token
        );

        const datos = respuesta.data;

        const lista = Array.isArray(datos)
          ? datos
          : datos?.docs || datos?.ordenes || [];

        if (activo) {
          setCompras(lista);
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setLoading(false);
      }
    };

    if (token) cargarCompras();

    return () => {
      activo = false;
    };
  }, [token]);

  const verDetalle = async (id) => {
    setCargandoDetalle(true);
    setErrorDetalle('');

    try {
      const respuesta = await compraService.obtenerDetalle(
        id,
        token
      );

      setDetalle(respuesta.data || respuesta.orden);
    } catch (err) {
      setErrorDetalle(err.message);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setDetalle(null);
    setErrorDetalle('');
  };

  const productosDetalle =
    detalle?.items || detalle?.productos || [];

  return (
    <div className={styles.container}>

      {/* ENCABEZADO */}
      <header className={styles.header}>
        <span className={styles.subtitle}>
          MI CUENTA
        </span>

        <h1>
          <ShoppingBag size={30} />
          Mis compras
        </h1>

        <p>
          Consultá tus compras realizadas y seguí
          el estado de tus pedidos.
        </p>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {errorDetalle && (
        <p className={styles.error} role="alert">
          {errorDetalle}
        </p>
      )}

      {loading ? (
        <div className={styles.message}>
          Cargando tus compras...
        </div>
      ) : !error && compras.length === 0 ? (
        <div className={styles.empty}>
          <Package size={54} />

          <h2>Todavía no realizaste compras</h2>

          <p>
            Explorá nuestro catálogo y encontrá
            los mejores componentes para tu PC.
          </p>

          <Link
            to="/productos"
            className={styles.catalogButton}
          >
            Explorar productos
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {compras.map((compra) => (
            <article
              key={compra._id}
              className={styles.orderCard}
            >
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderLabel}>
                    PEDIDO
                  </span>

                  <h2>
                    #{compra._id.slice(-8).toUpperCase()}
                  </h2>
                </div>

                <span
                  className={`${styles.status} ${
                    styles[compra.estado] || ''
                  }`}
                >
                  {ESTADOS[compra.estado] ||
                    compra.estado}
                </span>
              </div>

              <div className={styles.orderInfo}>
                <div>
                  <span>Fecha</span>
                  <strong>
                    {formatearFecha(compra.createdAt)}
                  </strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    {formatearPrecio(compra.total)}
                  </strong>
                </div>

                <div>
                  <span>Estado</span>
                  <strong>
                    {ESTADOS[compra.estado] ||
                      compra.estado}
                  </strong>
                </div>
              </div>

              <div className={styles.orderFooter}>
                <button
                  type="button"
                  className={styles.detailButton}
                  disabled={cargandoDetalle}
                  onClick={() =>
                    verDetalle(compra._id)
                  }
                >
                  <Eye size={18} />
                  Ver detalle
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* DETALLE DE COMPRA */}
      {detalle && (
        <div
          className={styles.modalOverlay}
          onClick={cerrarDetalle}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-compra"
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="titulo-compra">
                Pedido #{detalle._id.slice(-8).toUpperCase()}
              </h2>

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={cerrarDetalle}
              >
                <X size={21} />
              </button>
            </div>

            <div className={styles.modalContent}>

              <div className={styles.detailRow}>
                <span>Fecha</span>
                <strong>
                  {formatearFecha(detalle.createdAt)}
                </strong>
              </div>

              <div className={styles.detailRow}>
                <span>Estado</span>

                <span
                  className={`${styles.status} ${
                    styles[detalle.estado] || ''
                  }`}
                >
                  {ESTADOS[detalle.estado] ||
                    detalle.estado}
                </span>
              </div>

              <h3>Productos comprados</h3>

              {productosDetalle.length === 0 ? (
                <p>No hay productos para mostrar.</p>
              ) : (
                <ul className={styles.productList}>
                  {productosDetalle.map((item, index) => (
                    <li key={item._id || index}>
                      <div>
                        <strong>
                          {item.producto?.nombre ||
                            item.nombre ||
                            'Producto'}
                        </strong>

                        <small>
                          Cantidad: {item.cantidad}
                        </small>
                      </div>

                      <span>
                        {formatearPrecio(
                          item.subtotal ??
                          (item.precioUnitario ??
                            item.precio ?? 0) *
                            item.cantidad
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.total}>
                <span>Total</span>
                <strong>
                  {formatearPrecio(detalle.total)}
                </strong>
              </div>

              {detalle.metodoPago && (
                <div className={styles.detailRow}>
                  <span>Método de pago</span>
                  <strong>{detalle.metodoPago}</strong>
                </div>
              )}

            </div>
          </section>
        </div>
      )}

    </div>
  );
}

export default MisCompras;
