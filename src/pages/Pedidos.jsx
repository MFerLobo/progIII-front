import { useEffect, useState } from 'react';

import {
    ClipboardList,
    Eye,
    ArrowRight,
    X,
    Ban
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { pedidoService } from '../services/pedidoService';

import styles from './Pedidos.module.css';

const ETIQUETAS = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    preparando: 'Preparando',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
};

const SIGUIENTE_ESTADO = {
    pendiente: 'preparando',
    pagado: 'preparando',
    preparando: 'enviado',
    enviado: 'entregado'
};

const ACCIONES = {
    preparando: 'Comenzar preparación',
    enviado: 'Marcar como enviado',
    entregado: 'Marcar como entregado'
};

const ESTADOS_CANCELABLES = [
    'pendiente',
    'pagado',
    'preparando'
];

const formatearPrecio = (valor) =>
    Number(valor ?? 0).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS'
    });

const formatearFecha = (fecha) =>
    fecha
        ? new Date(fecha).toLocaleDateString('es-AR')
        : 'Sin fecha';

const obtenerCliente = (pedido) =>
    pedido?.usuario?.nombre ||
    pedido?.cliente?.nombre ||
    'Cliente no disponible';

const obtenerNumeroPedido = (pedido) =>
    String(pedido?._id || pedido?.id || '')
        .slice(-8)
        .toUpperCase();

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

    useEffect(() => {
        let activo = true;

        const cargarPedidos = async () => {
            setLoading(true);
            setError('');

            try {
                const respuesta =
                    await pedidoService.obtenerPedidos(
                        token,
                        pagina,
                        estadoFiltro
                    );

                const datos = respuesta.data;

                const lista = Array.isArray(datos)
                    ? datos
                    : datos?.docs || datos?.ordenes || [];

                if (activo) {
                    setPedidos(lista);
                    setPaginacion(
                        respuesta.pagination || datos || {}
                    );
                }
            } catch (err) {
                if (activo) {
                    setError(err.message);
                    setPedidos([]);
                }
            } finally {
                if (activo) {
                    setLoading(false);
                }
            }
        };

        if (token) {
            cargarPedidos();
        }

        return () => {
            activo = false;
        };
    }, [token, pagina, estadoFiltro, version]);

    const actualizarListado = () => {
        setVersion((actual) => actual + 1);
    };

    const verDetalle = async (id) => {
        setCargandoDetalle(true);
        setError('');

        try {
            const respuesta =
                await pedidoService.obtenerPedidoPorId(
                    id,
                    token
                );

            setDetalle(
                respuesta.data || respuesta.orden
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const cerrarDetalle = () => {
        if (guardandoId !== null) return;
        setDetalle(null);
    };

    const actualizarDetalle = (id, nuevoEstado) => {
        setDetalle((actual) => {
            if (!actual || actual._id !== id) {
                return actual;
            }

            return {
                ...actual,
                estado: nuevoEstado
            };
        });
    };

    const avanzarEstado = async (pedido) => {
        const siguiente = SIGUIENTE_ESTADO[pedido.estado];

        if (!siguiente || guardandoId !== null) {
            return;
        }

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
                `El pedido #${obtenerNumeroPedido(pedido)} pasó al estado "${ETIQUETAS[siguiente]}".`
            );

            actualizarDetalle(pedido._id, siguiente);
            actualizarListado();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardandoId(null);
        }
    };

    const cancelarPedido = async (pedido) => {
        if (
            !ESTADOS_CANCELABLES.includes(pedido.estado) ||
            guardandoId !== null
        ) {
            return;
        }

        const confirmar = window.confirm(
            `¿Querés cancelar el pedido #${obtenerNumeroPedido(pedido)}?\n\n` +
            'Esta acción cambiará su estado a "Cancelado" y puede reintegrar los productos al stock.'
        );

        if (!confirmar) return;

        setGuardandoId(pedido._id);
        setError('');
        setMensaje('');

        try {
            await pedidoService.actualizarEstado(
                pedido._id,
                'cancelado',
                token
            );

            setMensaje(
                `El pedido #${obtenerNumeroPedido(pedido)} fue cancelado correctamente.`
            );

            actualizarDetalle(pedido._id, 'cancelado');
            actualizarListado();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardandoId(null);
        }
    };

    const itemsDetalle =
        detalle?.items || detalle?.productos || [];

    return (
        <div className={styles.container}>

            <header className={styles.header}>
                <span className={styles.subtitle}>
                    PANEL DE EMPLEADOS
                </span>

                <h1>
                    <ClipboardList size={30} />
                    Gestión de pedidos
                </h1>

                <p>
                    Consultá los pedidos de los clientes,
                    preparalos y actualizá sus estados.
                </p>
            </header>

            <div className={styles.filters}>
                <label htmlFor="estado">
                    Filtrar por estado
                </label>

                <select
                    id="estado"
                    value={estadoFiltro}
                    disabled={guardandoId !== null}
                    onChange={(e) => {
                        setEstadoFiltro(e.target.value);
                        setPagina(1);
                        setMensaje('');
                    }}
                >
                    <option value="">
                        Todos los pedidos
                    </option>

                    {Object.entries(ETIQUETAS).map(
                        ([valor, nombre]) => (
                            <option
                                key={valor}
                                value={valor}
                            >
                                {nombre}
                            </option>
                        )
                    )}
                </select>
            </div>

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
                            <th className={styles.detailHeader}>Detalle</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7}>
                                    Cargando pedidos...
                                </td>
                            </tr>
                        ) : pedidos.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        ) : (
                            pedidos.map((pedido) => {
                                const siguiente =
                                    SIGUIENTE_ESTADO[pedido.estado];

                                const cancelable =
                                    ESTADOS_CANCELABLES.includes(
                                        pedido.estado
                                    );

                                const guardando =
                                    guardandoId === pedido._id;

                                return (
                                    <tr key={pedido._id}>
                                        <td className={styles.orderId}>
                                            #{obtenerNumeroPedido(pedido)}
                                        </td>

                                        <td>
                                            {formatearFecha(pedido.createdAt)}
                                        </td>

                                        <td>
                                            {obtenerCliente(pedido)}
                                        </td>

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
                                                {siguiente && (
                                                    <button
                                                        type="button"
                                                        className={styles.advanceButton}
                                                        disabled={guardandoId !== null}
                                                        onClick={() =>
                                                            avanzarEstado(pedido)
                                                        }
                                                    >
                                                        {guardando
                                                            ? 'Guardando...'
                                                            : ACCIONES[siguiente]}

                                                        <ArrowRight size={16} />
                                                    </button>
                                                )}

                                                {cancelable && (
                                                    <button
                                                        type="button"
                                                        className={styles.cancelIconButton}
                                                        disabled={guardandoId !== null}
                                                        onClick={() =>
                                                            cancelarPedido(pedido)
                                                        }
                                                        title="Cancelar pedido"
                                                        aria-label={`Cancelar pedido #${obtenerNumeroPedido(pedido)}`}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        <td className={styles.detailCell}>
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
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

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
                        setPagina((actual) => actual - 1);
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
                        setPagina((actual) => actual + 1);
                    }}
                >
                    Siguiente
                </button>
            </div>

            {detalle && (
                <div
                    className={styles.modalOverlay}
                    onClick={cerrarDetalle}
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
                                Pedido #{obtenerNumeroPedido(detalle)}
                            </h2>

                            <button
                                type="button"
                                aria-label="Cerrar detalle"
                                disabled={guardandoId !== null}
                                onClick={cerrarDetalle}
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
                                <span
                                    className={`${styles.status} ${
                                        styles[detalle.estado] || ''
                                    }`}
                                >
                                    {ETIQUETAS[detalle.estado] ||
                                        detalle.estado}
                                </span>
                            </p>

                            <h3>Productos</h3>

                            {itemsDetalle.length === 0 ? (
                                <p>
                                    No hay detalles de productos disponibles.
                                </p>
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
                                                    (
                                                        item.precioUnitario ??
                                                        item.precio ??
                                                        0
                                                    ) * item.cantidad
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
                                        {[
                                            detalle.direccionEnvio.calle,
                                            detalle.direccionEnvio.ciudad,
                                            detalle.direccionEnvio.provincia,
                                            detalle.direccionEnvio.codigoPostal
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}

                            {SIGUIENTE_ESTADO[detalle.estado] && (
                                <button
                                    type="button"
                                    className={styles.advanceButton}
                                    disabled={guardandoId !== null}
                                    onClick={() =>
                                        avanzarEstado(detalle)
                                    }
                                >
                                    {ACCIONES[
                                        SIGUIENTE_ESTADO[detalle.estado]
                                    ]}

                                    <ArrowRight size={16} />
                                </button>
                            )}

                            {ESTADOS_CANCELABLES.includes(
                                detalle.estado
                            ) && (
                                <button
                                    type="button"
                                    className={styles.cancelOrderButton}
                                    disabled={guardandoId !== null}
                                    onClick={() =>
                                        cancelarPedido(detalle)
                                    }
                                >
                                    <Ban size={17} />
                                    Cancelar pedido
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