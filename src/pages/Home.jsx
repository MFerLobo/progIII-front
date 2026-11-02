import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Layers,
  ShoppingBag
} from 'lucide-react';

import ProductCard from '../components/ProductCard';

import styles from './Home.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);

  const [errorCategorias, setErrorCategorias] = useState('');
  const [errorProductos, setErrorProductos] = useState('');

  // Obtener categorías
  useEffect(() => {
    const controller = new AbortController();

    const cargarCategorias = async () => {
      try {
        const response = await fetch(
          `${API_URL}/categorias?activo=true`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar las categorías');
        }

        const json = await response.json();

        if (!json.success) {
          throw new Error(json.message || 'Error al obtener categorías');
        }

        setCategorias(json.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setErrorCategorias(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCategorias(false);
        }
      }
    };

    cargarCategorias();

    return () => controller.abort();
  }, []);

  // Obtener 4 productos para la Home
  useEffect(() => {
    const controller = new AbortController();

    const cargarProductos = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '4',
          activo: 'true',
          sortBy: 'createdAt',
          order: 'desc'
        });

        const response = await fetch(
          `${API_URL}/productos?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos');
        }

        const json = await response.json();

        if (!json.success) {
          throw new Error(json.message || 'Error al obtener productos');
        }

        setProductos(json.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setErrorProductos(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProductos(false);
        }
      }
    };

    cargarProductos();

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.container}>

      {/* HERO / BIENVENIDA */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>

          <span className={styles.heroLabel}>
            BIENVENIDO A COMPUTECH
          </span>

          <h1>
            Potenciá tu
            <span> mundo digital.</span>
          </h1>

          <p>
            Encontrá los mejores componentes, periféricos
            y accesorios para llevar tu PC al siguiente nivel.
          </p>

          <Link to="/productos" className={styles.heroButton}>
            Explorar catálogo
            <ArrowRight size={19} />
          </Link>

        </div>

        <div className={styles.heroDecoration}>
          <Cpu size={120} strokeWidth={1} />
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className={styles.section}>

        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>
              EXPLORÁ COMPUTECH
            </span>

            <h2>Comprá por categoría</h2>

            <p>
              Encontrá rápidamente los componentes
              que estás buscando.
            </p>
          </div>
        </div>

        {loadingCategorias ? (
          <p className={styles.message}>
            Cargando categorías...
          </p>
        ) : errorCategorias ? (
          <p className={styles.error}>
            {errorCategorias}
          </p>
        ) : categorias.length === 0 ? (
          <p className={styles.message}>
            No hay categorías disponibles.
          </p>
        ) : (
          <div className={styles.categoriesGrid}>
            {categorias.map((categoria) => (
              <Link
                key={categoria._id}
                to={`/productos?categoria=${encodeURIComponent(categoria._id)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  <Layers size={28} />
                </div>

                <h3>{categoria.nombre}</h3>

                <p>
                  {categoria.descripcion ||
                    'Explorá nuestros productos'}
                </p>

                <span className={styles.categoryLink}>
                  Ver productos
                  <ArrowUpRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className={styles.section}>

        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>
              NUESTRA SELECCIÓN
            </span>

            <h2>Productos destacados</h2>

            <p>
              Descubrí algunos de los últimos productos
              incorporados a nuestra tienda.
            </p>
          </div>

          <Link
            to="/productos"
            className={styles.viewAllTop}
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </div>

        {loadingProductos ? (
          <p className={styles.message}>
            Cargando productos...
          </p>
        ) : errorProductos ? (
          <p className={styles.error}>
            {errorProductos}
          </p>
        ) : productos.length === 0 ? (
          <p className={styles.message}>
            No hay productos disponibles.
          </p>
        ) : (
          <div className={styles.productsGrid}>
            {productos.map((producto) => (
              <ProductCard
                key={producto._id}
                producto={producto}
              />
            ))}
          </div>
        )}

        <div className={styles.viewAllContainer}>
          <Link
            to="/productos"
            className={styles.viewAllButton}
          >
            <ShoppingBag size={19} />
            Mostrar todos los productos
            <ArrowRight size={18} />
          </Link>
        </div>

      </section>

    </div>
  );
}

export default Home;
