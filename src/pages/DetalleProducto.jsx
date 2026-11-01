
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  CheckCircle,
  XCircle,
  Cpu,
  Tag
} from 'lucide-react';

import { productoService } from '../services/productoService';

import styles from './DetalleProducto.module.css';

function DetalleProducto() {
  const { id } = useParams();
  const { agregarProducto } = useCart();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarProducto = async () => {
      setLoading(true);
      setError('');
      setProducto(null);

      try {
        const json = await productoService.getProductoById(id);

        if (!json.success) {
          throw new Error(
            json.message || 'No se pudo obtener el producto'
          );
        }

        if (activo) {
          setProducto(json.data);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarProducto();

    return () => {
      activo = false;
    };
  }, [id]);

  // ESTADOS DE CARGA

  if (loading) {
    return (
      <div className={styles.message}>
        <Package size={40} />
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className={styles.message}>
        <XCircle size={40} />

        <h2>No se pudo cargar el producto</h2>

        <p>{error || 'Producto no encontrado'}</p>

        <Link to="/productos" className={styles.backButton}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // DATOS DEL PRODUCTO

  const disponible = producto.stock > 0;

  const precioFormateado = Number(
    producto.precio
  ).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  // La imagen puede venir como URL o como objeto.
  const primeraImagen = producto.imagenes?.[0];

  const imagen =
    typeof primeraImagen === 'string'
      ? primeraImagen
      : primeraImagen?.url || null;

  return (
    <div className={styles.container}>

      {/* VOLVER AL CATÁLOGO */}
      <Link to="/productos" className={styles.backLink}>
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      {/* INFORMACIÓN PRINCIPAL */}
      <div className={styles.productLayout}>

        {/* IMAGEN */}
        <div className={styles.imageSection}>
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.noImage}>
              <Package size={70} />
              <span>Imagen no disponible</span>
            </div>
          )}
        </div>

        {/* DETALLES */}
        <div className={styles.infoSection}>

          <span className={styles.category}>
            {producto.categoria?.nombre || 'Sin categoría'}
          </span>

          <h1 className={styles.productName}>
            {producto.nombre}
          </h1>

          <p className={styles.sku}>
            SKU: {producto.sku || 'N/A'}
          </p>

          <div className={styles.divider}></div>

          {/* PRECIO */}
          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>
              Precio
            </span>

            <span className={styles.price}>
              {precioFormateado}
            </span>
          </div>

          {/* STOCK */}
          <div
            className={`${styles.stockSection} ${disponible ? '' : styles.noStock
              }`}
          >
            {disponible ? (
              <>
                <CheckCircle size={20} />

                <span>
                  Disponible ({producto.stock} unidades)
                </span>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <span>Sin stock</span>
              </>
            )}
          </div>

          {/* BOTÓN DEL CARRITO */}
          <button
            type="button"
            className={styles.cartButton}
            disabled={!disponible}
            onClick={() => agregarProducto(producto)}
          >
            <ShoppingCart size={20} />
            {disponible ? 'Agregar al carrito' : 'Sin stock'}
          </button>

          {/* DATOS ADICIONALES */}
          <div className={styles.extraInfo}>

            <div className={styles.infoItem}>
              <Tag size={19} />

              <div>
                <span>Marca</span>
                <strong>
                  {producto.marca?.nombre || 'Genérica'}
                </strong>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Cpu size={19} />

              <div>
                <span>Categoría</span>
                <strong>
                  {producto.categoria?.nombre || 'N/A'}
                </strong>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <section className={styles.descriptionSection}>
        <h2>Descripción del producto</h2>

        <p>
          {producto.descripcion ||
            'Este producto no tiene una descripción disponible.'}
        </p>
      </section>

    </div>
  );
}

export default DetalleProducto;
