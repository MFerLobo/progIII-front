
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  User,
  ChevronDown,
  Package,
  Boxes,
  ClipboardList,
  Users,
  LogOut
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import styles from './UserMenu.module.css';

function UserMenu() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera
  // o presionar Escape.
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setAbierto(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
      }
    };

    document.addEventListener('pointerdown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleClickFuera
      );
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Cerrar al navegar
  const cerrarMenu = () => {
    setAbierto(false);
  };

  const handleLogout = () => {
    cerrarMenu();
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.container} ref={menuRef}>

      {/* BOTÓN DE USUARIO */}
      <button
        type="button"
        className={styles.userButton}
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls="menu-usuario"
        aria-label="Opciones de mi cuenta"
      >
        <User size={20} />

        <span className={styles.userName}>
          {usuario?.nombre || 'Mi cuenta'}
        </span>

        <ChevronDown
          size={16}
          className={
            abierto
              ? styles.chevronOpen
              : styles.chevron
          }
        />
      </button>

      {/* MENÚ DESPLEGABLE */}
      {abierto && (
        <div
          id="menu-usuario"
          className={styles.dropdown}
        >

          {/* INFORMACIÓN DEL USUARIO */}
          <div className={styles.userInfo}>
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.email}</span>

            <small className={styles.role}>
              {usuario?.rol}
            </small>
          </div>

          <div className={styles.divider}></div>

          {/* OPCIÓN COMÚN */}
          <Link
            to="/perfil"
            className={styles.menuItem}
            onClick={cerrarMenu}
          >
            <User size={18} />
            Mi perfil
          </Link>

          {/* CLIENTE */}
          {usuario?.rol === 'cliente' && (
            <Link
              to="/mis-compras"
              className={styles.menuItem}
              onClick={cerrarMenu}
            >
              <Package size={18} />
              Mis compras
            </Link>
          )}

          {/* EMPLEADO */}
          {usuario?.rol === 'empleado' && (
            <>
              <Link
                to="/inventario"
                className={styles.menuItem}
                onClick={cerrarMenu}
              >
                <Boxes size={18} />
                Gestionar inventario
              </Link>

              <Link
                to="/pedidos"
                className={styles.menuItem}
                onClick={cerrarMenu}
              >
                <ClipboardList size={18} />
                Gestión de pedidos
              </Link>
            </>
          )}

          {/* ADMINISTRADOR */}
          {usuario?.rol === 'admin' && (
            <Link
              to="/admin/usuarios"
              className={styles.menuItem}
              onClick={cerrarMenu}
            >
              <Users size={18} />
              Administrar usuarios
            </Link>
          )}

          <div className={styles.divider}></div>

          {/* CERRAR SESIÓN */}
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

        </div>
      )}
    </div>
  );
}

export default UserMenu;
