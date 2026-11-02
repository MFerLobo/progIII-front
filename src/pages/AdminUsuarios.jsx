
import { useEffect, useState } from 'react';

import {
    Users,
    UserPlus,
    Pencil,
    UserX,
    UserCheck,
    X,
    Save
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usuarioService } from '../services/usuarioService';

import styles from './AdminUsuarios.module.css';

const FORM_INICIAL = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente'
};

const ROLES = ['cliente', 'empleado', 'admin'];

function AdminUsuarios() {
    const { token, usuario: usuarioActual } = useAuth();

    const esUsuarioActual = (id) => {
        return String(id) === String(
            usuarioActual?._id || usuarioActual?.id
        );
    };
    const [usuarios, setUsuarios] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [paginacion, setPaginacion] = useState({});

    const [filtroRol, setFiltroRol] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('');

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const [formVisible, setFormVisible] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(FORM_INICIAL);

    const [version, setVersion] = useState(0);

    // OBTENER USUARIOS
    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            setLoading(true);
            setError('');

            try {
                const respuesta = await usuarioService.obtenerUsuarios(
                    token,
                    pagina,
                    filtroRol,
                    filtroActivo
                );

                const datos = respuesta.data;

                if (activo) {
                    setUsuarios(
                        Array.isArray(datos)
                            ? datos
                            : datos?.docs || datos?.usuarios || []
                    );

                    setPaginacion(respuesta.pagination || datos || {});
                }
            } catch (err) {
                if (activo) setError(err.message);
            } finally {
                if (activo) setLoading(false);
            }
        };

        if (token) cargar();

        return () => {
            activo = false;
        };
    }, [token, pagina, filtroRol, filtroActivo, version]);

    const nuevoUsuario = () => {
        setForm(FORM_INICIAL);
        setEditandoId(null);
        setFormVisible(true);
        setError('');
        setMensaje('');
    };

    const editarUsuario = (usuario) => {
        setForm({
            nombre: usuario.nombre || '',
            email: usuario.email || '',
            password: '',
            telefono: usuario.telefono || '',
            rol: usuario.rol || 'cliente'
        });

        setEditandoId(usuario._id);
        setFormVisible(true);
        setError('');
        setMensaje('');
    };

    const cerrarFormulario = () => {
        setFormVisible(false);
        setEditandoId(null);
        setForm(FORM_INICIAL);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const guardarUsuario = async (e) => {
        e.preventDefault();

        if (!ROLES.includes(form.rol)) {
            setError('Seleccioná un rol válido.');
            return;
        }

        if (!editandoId && form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }


        const datos = {
            nombre: form.nombre.trim(),
            email: form.email.trim(),
            telefono: form.telefono.trim()
        };

        // Solo permitir editar el rol de otros usuarios
        if (!editandoId || !esUsuarioActual(editandoId)) {
            datos.rol = form.rol;
        }


        if (!editandoId) {
            datos.password = form.password;
        }

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            if (editandoId) {
                await usuarioService.actualizarUsuario(
                    editandoId,
                    datos,
                    token
                );

                setMensaje('Usuario actualizado correctamente.');
            } else {
                await usuarioService.crearUsuario(datos, token);
                setMensaje('Usuario creado correctamente.');
            }

            cerrarFormulario();
            setVersion((prev) => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const desactivarUsuario = async (usuario) => {
        if (usuario._id === (usuarioActual?._id || usuarioActual?.id)) {
            setError('No podés desactivar tu propia cuenta.');
            return;
        }

        const confirmar = window.confirm(
            `¿Querés desactivar a ${usuario.nombre}?`
        );

        if (!confirmar) return;

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            await usuarioService.desactivarUsuario(
                usuario._id,
                token
            );

            setMensaje('Usuario desactivado correctamente.');
            setVersion((prev) => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };


    const reactivarUsuario = async (usuario) => {
        const confirmar = window.confirm(
            `¿Querés reactivar la cuenta de ${usuario.nombre}?`
        );

        if (!confirmar) return;

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            await usuarioService.reactivarUsuario(
                usuario._id,
                token
            );

            setMensaje(
                `El usuario ${usuario.nombre} fue reactivado correctamente.`
            );

            // Actualizar el listado desde el backend
            setVersion((prev) => prev + 1);

        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };


    return (
        <div className={styles.container}>

            {/* ENCABEZADO */}
            <header className={styles.header}>
                <div>
                    <span className={styles.subtitle}>
                        PANEL DE ADMINISTRACIÓN
                    </span>

                    <h1>
                        <Users size={30} />
                        Administración de usuarios
                    </h1>

                    <p>
                        Gestioná las cuentas y los roles de COMPUTECH.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={nuevoUsuario}
                >
                    <UserPlus size={18} />
                    Nuevo usuario
                </button>
            </header>

            {/* FILTROS */}
            <div className={styles.filters}>
                <div>
                    <label htmlFor="rol">Rol</label>

                    <select
                        id="rol"
                        value={filtroRol}
                        onChange={(e) => {
                            setFiltroRol(e.target.value);
                            setPagina(1);
                        }}
                    >
                        <option value="">Todos los roles</option>
                        <option value="cliente">Clientes</option>
                        <option value="empleado">Empleados</option>
                        <option value="admin">Administradores</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="activo">Estado</label>

                    <select
                        id="activo"
                        value={filtroActivo}
                        onChange={(e) => {
                            setFiltroActivo(e.target.value);
                            setPagina(1);
                        }}
                    >
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>
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

            {/* TABLA DE USUARIOS */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>Cargando usuarios...</td>
                            </tr>
                        ) : usuarios.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario._id}>
                                    <td className={styles.userName}>
                                        {usuario.nombre}
                                    </td>

                                    <td>{usuario.email}</td>
                                    <td>{usuario.telefono || '—'}</td>

                                    <td>
                                        <span
                                            className={`${styles.role} ${styles[usuario.rol] || ''
                                                }`}
                                        >
                                            {usuario.rol}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                usuario.activo
                                                    ? styles.active
                                                    : styles.inactive
                                            }
                                        >
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>

                                    <td>

                                        <div className={styles.actions}>

                                            {/* EDITAR */}
                                            <button
                                                type="button"
                                                className={styles.editButton}
                                                disabled={guardando}
                                                onClick={() => editarUsuario(usuario)}
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </button>

                                            {/* DESACTIVAR O REACTIVAR */}
                                            {usuario.activo ? (
                                                <button
                                                    type="button"
                                                    className={styles.deleteButton}
                                                    disabled={
                                                        guardando ||
                                                        String(usuario._id) === String(
                                                            usuarioActual?._id || usuarioActual?.id
                                                        )
                                                    }
                                                    onClick={() => desactivarUsuario(usuario)}
                                                    title="Desactivar usuario"
                                                    aria-label={`Desactivar a ${usuario.nombre}`}
                                                >
                                                    <UserX size={17} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={styles.reactivateButton}
                                                    disabled={guardando}
                                                    onClick={() => reactivarUsuario(usuario)}
                                                    title="Reactivar usuario"
                                                    aria-label={`Reactivar a ${usuario.nombre}`}
                                                >
                                                    <UserCheck size={17} />
                                                </button>
                                            )}

                                        </div>

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
            <div className={styles.pagination}>
                <button
                    type="button"
                    disabled={loading || !paginacion.hasPrevPage}
                    onClick={() => setPagina((prev) => prev - 1)}
                >
                    Anterior
                </button>

                <span>
                    Página {paginacion.currentPage || pagina}
                    {' '}de {paginacion.totalPages || 1}
                </span>

                <button
                    type="button"
                    disabled={loading || !paginacion.hasNextPage}
                    onClick={() => setPagina((prev) => prev + 1)}
                >
                    Siguiente
                </button>
            </div>

            {/* FORMULARIO DE CREACIÓN Y EDICIÓN */}
            {formVisible && (
                <div className={styles.modalOverlay}>
                    <section
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-titulo"
                    >
                        <div className={styles.modalHeader}>
                            <h2 id="form-titulo">
                                {editandoId ? 'Editar usuario' : 'Nuevo usuario'}
                            </h2>

                            <button
                                type="button"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            onSubmit={guardarUsuario}
                            className={styles.form}
                        >
                            <label>
                                Nombre
                                <input
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Correo electrónico
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            {!editandoId && (
                                <label>
                                    Contraseña
                                    <input
                                        type="password"
                                        name="password"
                                        minLength={6}
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                    />
                                </label>
                            )}

                            <label>
                                Teléfono
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={form.telefono}
                                    onChange={handleChange}
                                />
                            </label>


                            <label>
                                Rol

                                <select
                                    name="rol"
                                    value={form.rol}
                                    onChange={handleChange}
                                    disabled={
                                        editandoId !== null &&
                                        esUsuarioActual(editandoId)
                                    }
                                    required
                                >
                                    <option value="cliente">Cliente</option>
                                    <option value="empleado">Empleado</option>
                                    <option value="admin">Administrador</option>
                                </select>

                                {editandoId && esUsuarioActual(editandoId) && (
                                    <small className={styles.formHelp}>
                                        No podés modificar tu propio rol de administrador.
                                    </small>
                                )}
                            </label>


                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={guardando}
                                >
                                    <Save size={17} />
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminUsuarios;
