
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import styles from './Productos.module.css';

const API_URL = import.meta.env.VITE_API_URL;
const LIMITE = 9;

const filtrosIniciales = {
  q: '',
  categoria: '',
  marca: '',
  minPrecio: '',
  maxPrecio: '',
  enStock: false,
  sortBy: 'createdAt',
  order: 'desc'
};

function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filtros que están aplicados en la URL.
  const filtrosActivos = {
    q: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    marca: searchParams.get('marca') || '',
    minPrecio: searchParams.get('minPrecio') || '',
    maxPrecio: searchParams.get('maxPrecio') || '',
    enStock: searchParams.get('enStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc'
  };

  const paginaActual = Math.max(
    1,
    Number.parseInt(searchParams.get('page'), 10) || 1
  );

  // Estado del formulario, antes de aplicar filtros.
  const [filtros, setFiltros] = useState(filtrosActivos);

  // Actualizar formulario cuando cambia la URL.
  useEffect(() => {
    setFiltros({
      q: searchParams.get('q') || '',
      categoria: searchParams.get('categoria') || '',
      marca: searchParams.get('marca') || '',
      minPrecio: searchParams.get('minPrecio') || '',
      maxPrecio: searchParams.get('maxPrecio') || '',
      enStock: searchParams.get('enStock') === 'true',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      order: searchParams.get('order') || 'desc'
    });
  }, [searchParams]);

  // Obtener categorías y marcas.
  useEffect(() => {
    const controller = new AbortController();

    const cargarOpciones = async () => {
      try {
        const [resCategorias, resMarcas] = await Promise.all([
          fetch(`${API_URL}/categorias?activo=true`, {
            signal: controller.signal
          }),
          fetch(`${API_URL}/marcas?activo=true`, {
            signal: controller.signal
          })
        ]);

        if (!resCategorias.ok || !resMarcas.ok) {
          throw new Error('No se pudieron cargar los filtros');
        }

        const [jsonCategorias, jsonMarcas] = await Promise.all([
          resCategorias.json(),
          resMarcas.json()
        ]);

        if (!jsonCategorias.success || !jsonMarcas.success) {
          throw new Error('Error al obtener categorías o marcas');
        }

        setCategorias(jsonCategorias.data);
        setMarcas(jsonMarcas.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando filtros:', err);
        }
      }
    };

    cargarOpciones();

    return () => controller.abort();
  }, []);

  // Obtener productos usando los filtros de la URL.
  useEffect(() => {
    const controller = new AbortController();

    const cargarProductos = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams(searchParams);

        params.set('page', String(paginaActual));
        params.set('limit', String(LIMITE));
        params.set('activo', 'true');

        const response = await fetch(
          `${API_URL}/productos?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos');
        }

        const json = await response.json();

        if (!json.success) {
          throw new Error(json.message || 'Error del servidor');
        }

        setProductos(json.data);
        setPaginacion(json.pagination);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setProductos([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    cargarProductos();

    return () => controller.abort();
  }, [searchParams, paginaActual]);

  // Actualizar valores del formulario.
  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Aplicar filtros y actualizar la URL.
  const aplicarFiltros = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '' && valor !== false) {
        params.set(clave, String(valor));
      }
    });

    params.set('page', '1');
    setSearchParams(params);
  };

  // Volver al catálogo completo.
  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    setSearchParams(new URLSearchParams());
  };

  // Cambiar página sin perder los filtros.
  const cambiarPagina = (nuevaPagina) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nuevaPagina));
    setSearchParams(params);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cambiar orden inmediatamente.
  const cambiarOrden = (e) => {
    const [sortBy, order] = e.target.value.split(':');

    setFiltros((prev) => ({
      ...prev,
      sortBy,
      order
    }));

    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    params.set('order', order);
    params.set('page', '1');

    setSearchParams(params);
  };

  return (
    <div className={styles.container}>

      {/* ENCABEZADO */}
      <section className={styles.header}>
        <span className={styles.subtitle}>
          COMPUTECH / TIENDA
        </span>

        <h1>Nuestro catálogo</h1>

        <p>
          Encontrá los mejores componentes y accesorios
          para llevar tu PC al siguiente nivel.
        </p>
      </section>

      {/* FILTROS */}
      <ProductFilters
        filtros={filtros}
        categorias={categorias}
        marcas={marcas}
        onChange={handleFiltroChange}
        onAplicar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
      />

      {/* RESULTADOS */}
      <section className={styles.productsSection}>

        <div className={styles.productsHeader}>
          <div>
            <h2>Todos los productos</h2>

            <p>
              {loading
                ? 'Buscando productos...'
                : `${paginacion.totalDocs} productos encontrados`}
            </p>
          </div>

          <div className={styles.sortContainer}>
            <label htmlFor="orden">Ordenar por:</label>

            <select
              id="orden"
              value={`${filtrosActivos.sortBy}:${filtrosActivos.order}`}
              onChange={cambiarOrden}
            >
              <option value="createdAt:desc">
                Más recientes
              </option>

              <option value="precio:asc">
                Menor precio
              </option>

              <option value="precio:desc">
                Mayor precio
              </option>

              <option value="nombre:asc">
                Nombre A-Z
              </option>

              <option value="nombre:desc">
                Nombre Z-A
              </option>
            </select>
          </div>
        </div>

        {/* ESTADOS DE CARGA */}
        {loading ? (
          <div className={styles.message}>
            Cargando productos...
          </div>
        ) : error ? (
          <div className={styles.error}>
            {error}
          </div>
        ) : productos.length === 0 ? (
          <div className={styles.message}>
            <Search size={40} />

            <h3>No encontramos productos</h3>

            <p>
              Probá modificando los filtros de búsqueda.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className={styles.applyButton}
            >
              Ver todos los productos
            </button>
          </div>
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

        {/* PAGINACIÓN */}
        {!loading && !error && paginacion.totalPages > 1 && (
          <div className={styles.pagination}>

            <button
              type="button"
              disabled={!paginacion.hasPrevPage}
              onClick={() => cambiarPagina(paginaActual - 1)}
            >
              Anterior
            </button>

            <span>
              Página {paginacion.currentPage} de{' '}
              {paginacion.totalPages}
            </span>

            <button
              type="button"
              disabled={!paginacion.hasNextPage}
              onClick={() => cambiarPagina(paginaActual + 1)}
            >
              Siguiente
            </button>

          </div>
        )}

      </section>
    </div>
  );
}

export default Productos;
