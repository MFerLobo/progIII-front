
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

import styles from './ProductCard.module.css';

function ProductCard({ producto }) {
    const {
        _id,
        nombre,
        sku,
        precio,
        stock,
        categoria,
        marca,
        imagenes
    } = producto;

    const disponible = stock > 0;
    const imagen = imagenes?.[0];
    const { agregarProducto } = useCart();
    const precioFormateado = Number(precio).toLocaleString(
        'es-AR',
        {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }
    );

    return (
        <article className={styles.card}>

            {/* Imagen del producto */}
            <Link
                to={`/productos/${_id}`}
                className={styles.imageContainer}
            >
                {imagen ? (
                    <img
                        src={imagen}
                        alt={nombre}
                        className={styles.productImage}
                    />
                ) : (
                    <div className={styles.noImage}>
                        <Package size={48} />
                        <span>Sin imagen</span>
                    </div>
                )}
            </Link>

            {/* Información */}
            <div className={styles.content}>

                <div className={styles.topInfo}>
                    <span className={styles.category}>
                        {categoria?.nombre || 'Sin categoría'}
                    </span>

                    <span
                        className={
                            disponible
                                ? styles.inStock
                                : styles.outOfStock
                        }
                    >
                        {disponible ? 'En stock' : 'Sin stock'}
                    </span>
                </div>

                <Link
                    to={`/productos/${_id}`}
                    className={styles.productName}
                >
                    {nombre}
                </Link>

                <p className={styles.brand}>
                    {marca?.nombre || 'Marca genérica'}
                </p>

                <p className={styles.sku}>
                    SKU: {sku}
                </p>

                <div className={styles.bottom}>

                    <div className={styles.priceContainer}>
                        <span className={styles.price}>
                            {precioFormateado}
                        </span>

                        <span className={styles.stock}>
                            {stock} disponibles
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.cartButton}
                        disabled={!disponible}
                        onClick={() => agregarProducto(producto)}
                    >
                        <ShoppingCart size={18} />
                        {disponible ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                </div>

            </div>
        </article>
    );
}

export default ProductCard;
