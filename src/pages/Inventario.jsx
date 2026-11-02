import { useEffect, useState } from 'react';

import {
    Search,
    Pencil,
    Save,
    X,
    Boxes,
    Plus,
    Archive
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { inventarioService } from '../services/inventarioService';

import CrearProductoModal from '../components/CrearProductoModal';

import styles from './Inventario.module.css';

function Inventario() {
    const { token } = useAuth();

    // PRODUCTOS Y FILTROS
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [terminoActivo, setTerminoActivo] = useState('');
    const [pagina, setPagina] = useState(1);
    const [paginacion, setPaginacion] = useState({});

    // ESTADOS GENERALES
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // EDICIÓN DE PRODUCTOS
    const [editandoId, setEditandoId] = useState(null);

    const [form, setForm] = useState({
        precio: '',
        stock: ''
    });

    // CREACIÓN DE PRODUCTOS
    const [mostrarCrear, setMostrarCrear] = useState(false);

    // Permite actualizar el listado después de crear o desactivar
    const [version, setVersion] = useState(0);

    // OBTENER PRODUCTOS
    useEffect(() => {
        let activo = true;

        const obtenerProductos = async () => {
            setLoading(true);
            setError('');

            try {
                const respuesta =
                    await inventarioService.obtenerProductos(
                        pagina,
                        terminoActivo
                    );

                if (activo) {
                    setProductos(respuesta.data || []);
                    setPaginacion(respuesta.pagination || {});
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

        obtenerProductos();

        return () => {
            activo = false;
        };
    }, [pagina, terminoActivo, version]);

    // ACTUALIZAR EL LISTADO MANUALMENTE
    const actualizarListado = () => {
        setVersion((actual) => actual + 1);
    };

    // BUSCAR PRODUCTOS
    const handleBuscar = (e) => {
        e.preventDefault();

        const termino = busqueda.trim();

        setEditandoId(null);
        setMensaje('');

        if (pagina === 1 && termino === terminoActivo) {
            actualizarListado();
        } else {
            setPagina(1);
            setTerminoActivo(termino);
        }
    };

    // COMENZAR EDICIÓN
    const editarProducto = (producto) => {
        setEditandoId(producto._id);

        setForm({
            precio: String(producto.precio),
            stock: String(producto.stock)
        });

        setError('');
        setMensaje('');
    };

    // CANCELAR EDICIÓN
    const cancelarEdicion = () => {
        setEditandoId(null);

        setForm({
            precio: '',
            stock: ''
        });
    };

    // GUARDAR CAMBIOS DE PRECIO Y STOCK
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
            setError('Ingresá un precio y un stock válidos.');
            return;
        }

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            // Actualizar solamente los campos modificados
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

            cancelarEdicion();

            setMensaje(
                `El producto "${producto.nombre}" fue actualizado correctamente.`
            );

            actualizarListado();

        } catch (err) {
            setError(
                `${err.message}. Revisá los valores actuales del producto.`
            );

            // Refrescar los valores desde el backend
            cancelarEdicion();
            actualizarListado();

        } finally {
            setGuardando(false);
        }
    };

    // DESACTIVAR PRODUCTO
    const desactivarProducto = async (producto) => {
        const confirmar = window.confirm(
            `¿Querés desactivar "${producto.nombre}"?\n\n` +
            'El producto dejará de aparecer en el catálogo.'
        );

        if (!confirmar) return;

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            await inventarioService.desactivarProducto(
                producto._id,
                token
            );

            setMensaje(
                `El producto "${producto.nombre}" fue desactivado correctamente.`
            );

            actualizarListado();

        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    // CUANDO SE CREA UN PRODUCTO
    const productoCreado = () => {
        setMostrarCrear(false);
        setEditandoId(null);

        setError('');
        setMensaje('Producto creado correctamente.');

        // Limpiar los filtros y volver a la primera página
        setBusqueda('');
        setTerminoActivo('');
        setPagina(1);

        actualizarListado();
    };

    // FORMATEAR PRECIOS
    const formatearPrecio = (precio) =>
        Number(precio).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
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

                <button
                    type="button"
                    className={styles.newButton}
                    onClick={() => setMostrarCrear(true)}
                    disabled={
                        guardando ||
                        editandoId !== null
                    }
                >
                    <Plus size={18} />
                    Nuevo producto
                </button>
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
                        aria-label="Buscar productos"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || guardando}
                >
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

            {/* TABLA DE PRODUCTOS */}
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

                                        {/* PRODUCTO */}
                                        <td>
                                            <div className={styles.productInfo}>
                                                <strong>
                                                    {producto.nombre}
                                                </strong>

                                                <small>
                                                    {producto.sku}
                                                </small>
                                            </div>
                                        </td>

                                        {/* CATEGORÍA */}
                                        <td>
                                            {producto.categoria?.nombre ||
                                                'Sin categoría'}
                                        </td>

                                        {/* MARCA */}
                                        <td>
                                            {producto.marca?.nombre ||
                                                'Sin marca'}
                                        </td>

                                        {/* PRECIO */}
                                        <td>
                                            {editando ? (
                                                <input
                                                    className={styles.editInput}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.precio}
                                                    onChange={(e) =>
                                                        setForm((actual) => ({
                                                            ...actual,
                                                            precio: e.target.value
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                formatearPrecio(producto.precio)
                                            )}
                                        </td>

                                        {/* STOCK */}
                                        <td>
                                            {editando ? (
                                                <input
                                                    className={styles.editInput}
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={form.stock}
                                                    onChange={(e) =>
                                                        setForm((actual) => ({
                                                            ...actual,
                                                            stock: e.target.value
                                                        }))
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

                                        {/* ACCIONES */}
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
                                                            title="Cancelar edición"
                                                        >
                                                            <X size={17} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={styles.editButton}
                                                            disabled={
                                                                editandoId !== null ||
                                                                guardando
                                                            }
                                                            onClick={() =>
                                                                editarProducto(producto)
                                                            }
                                                        >
                                                            <Pencil size={17} />
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={styles.deactivateButton}
                                                            disabled={
                                                                editandoId !== null ||
                                                                guardando
                                                            }
                                                            onClick={() =>
                                                                desactivarProducto(producto)
                                                            }
                                                            title="Desactivar producto"
                                                            aria-label={
                                                                `Desactivar ${producto.nombre}`
                                                            }
                                                        >
                                                            <Archive size={17} />
                                                        </button>
                                                    </>
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
                    onClick={() =>
                        setPagina((actual) => actual - 1)
                    }
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
                        !paginacion.hasNextPage ||
                        loading ||
                        guardando ||
                        editandoId !== null
                    }
                    onClick={() =>
                        setPagina((actual) => actual + 1)
                    }
                >
                    Siguiente
                </button>
            </div>

            {/* MODAL PARA CREAR PRODUCTOS */}
            {mostrarCrear && (
                <CrearProductoModal
                    onCerrar={() => setMostrarCrear(false)}
                    onCreado={productoCreado}
                />
            )}

        </div>
    );
}

export default Inventario;
