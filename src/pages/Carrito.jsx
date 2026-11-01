
import { Link } from 'react-router-dom';

import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  ShoppingBag
} from 'lucide-react';

import { useCart } from '../context/CartContext';

import styles from './Carrito.module.css';

function Carrito() {
  const {
    items,
    cantidadTotal,
    precioTotal,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito
  } = useCart();

  const formatearPrecio = (precio) => {
    return Number(precio).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    });
  };

  const obtenerImagen = (imagen) => {
    if (typeof imagen === 'string') {
      return imagen;
    }

    return imagen?.url || null;
  };

  // CARRITO VACÍO
  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <ShoppingCart size={65} />

          <h1>Tu carrito está vacío</h1>

          <p>
            Todavía no agregaste productos a tu carrito.
            Explorá nuestro catálogo y encontrá lo que buscás.
          </p>

          <Link to="/productos" className={styles.shopButton}>
            <ShoppingBag size={19} />
            Explorar productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* ENCABEZADO */}
      <div className={styles.header}>
        <Link to="/productos" className={styles.backLink}>
          <ArrowLeft size={18} />
          Seguir comprando
        </Link>

        <div className={styles.title}>
          <ShoppingCart size={30} />
          <h1>Mi carrito</h1>
        </div>

        <p>
          Tenés {cantidadTotal}{' '}
          {cantidadTotal === 1 ? 'producto' : 'productos'}
          {' '}en tu carrito.
        </p>
      </div>

      {/* CONTENIDO */}
      <div className={styles.cartLayout}>

        {/* LISTA DE PRODUCTOS */}
        <section className={styles.productsSection}>

          <div className={styles.sectionHeader}>
            <h2>Productos seleccionados</h2>

            <button
              type="button"
              className={styles.clearButton}
              onClick={vaciarCarrito}
            >
              <Trash2 size={17} />
              Vaciar carrito
            </button>
          </div>

          <div className={styles.productsList}>
            {items.map((item) => {
              const imagen = obtenerImagen(item.imagen);

              return (
                <article
                  key={item._id}
                  className={styles.cartItem}
                >
                  {/* IMAGEN */}
                  <Link
                    to={`/productos/${item._id}`}
                    className={styles.imageContainer}
                  >
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={item.nombre}
                      />
                    ) : (
                      <Package size={42} />
                    )}
                  </Link>

                  {/* INFORMACIÓN */}
                  <div className={styles.productInfo}>
                    <Link
                      to={`/productos/${item._id}`}
                      className={styles.productName}
                    >
                      {item.nombre}
                    </Link>

                    <span className={styles.unitPrice}>
                      {formatearPrecio(item.precio)} c/u
                    </span>

                    {/* CONTROLES DE CANTIDAD */}
                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                        disabled={item.cantidad <= 1}
                        onClick={() =>
                          actualizarCantidad(
                            item._id,
                            item.cantidad - 1
                          )
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <span>{item.cantidad}</span>

                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${item.nombre}`}
                        disabled={item.cantidad >= item.stock}
                        onClick={() =>
                          actualizarCantidad(
                            item._id,
                            item.cantidad + 1
                          )
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <span className={styles.stockInfo}>
                      Stock conocido: {item.stock} unidades
                    </span>
                  </div>

                  {/* SUBTOTAL Y ELIMINAR */}
                  <div className={styles.itemActions}>
                    <strong className={styles.subtotal}>
                      {formatearPrecio(
                        item.precio * item.cantidad
                      )}
                    </strong>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label={`Eliminar ${item.nombre}`}
                      onClick={() =>
                        eliminarProducto(item._id)
                      }
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* RESUMEN DE COMPRA */}
        <aside className={styles.summary}>
          <h2>Resumen de compra</h2>

          <div className={styles.summaryRow}>
            <span>Productos ({cantidadTotal})</span>

            <span>
              {formatearPrecio(precioTotal)}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span>Envío</span>
            <span>A calcular</span>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.totalRow}>
            <span>Subtotal estimado</span>

            <strong>
              {formatearPrecio(precioTotal)}
            </strong>
          </div>

          <p className={styles.summaryNote}>
            El precio final y la disponibilidad se
            verificarán al confirmar la compra.
          </p>

          {/* Se habilitará al implementar checkout */}
          <button
            type="button"
            className={styles.checkoutButton}
            disabled
            title="Próximamente: finalizar compra"
          >
            <ShoppingBag size={19} />
            Finalizar compra
          </button>

          <Link
            to="/productos"
            className={styles.continueLink}
          >
            Seguir comprando
          </Link>
        </aside>

      </div>
    </div>
  );
}

export default Carrito;
