
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import UserMenu from './UserMenu';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();

  const { cantidadTotal } = useCart();
  const { autenticado } = useAuth();

  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const handleBuscar = (e) => {
    e.preventDefault();

    const termino = busqueda.trim();

    if (!termino) return;

    navigate(
      `/productos?q=${encodeURIComponent(termino)}`
    );

    cerrarMenu();
  };

  return (
    <header className={styles.navbar}>

      {/* LOGO */}
      <Link
        to="/"
        className={styles.logo}
        onClick={cerrarMenu}
      >
        <span className={styles.logoAccent}>
          COMPU
        </span>
        TECH
      </Link>

      {/* NAVEGACIÓN */}
      <nav
        id="navbar-navigation"
        aria-label="Navegación principal"
        className={`${styles.navLinks} ${
          menuAbierto ? styles.navLinksOpen : ''
        }`}
      >
        <NavLink
          to="/"
          end
          onClick={cerrarMenu}
          className={({ isActive }) =>
            isActive ? styles.active : ''
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/productos"
          onClick={cerrarMenu}
          className={({ isActive }) =>
            isActive ? styles.active : ''
          }
        >
          Productos
        </NavLink>
      </nav>

      {/* BUSCADOR */}
      <form
        className={styles.searchContainer}
        onSubmit={handleBuscar}
        role="search"
      >
        <Search size={19} aria-hidden="true" />

        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos"
        />
      </form>

      {/* ACCIONES */}
      <div className={styles.actions}>

        {autenticado ? (
          <UserMenu />
        ) : (
          <Link
            to="/login"
            className={styles.iconButton}
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
          >
            <User size={21} />
          </Link>
        )}

        <Link
          to="/carrito"
          className={styles.cartButton}
          aria-label={`Carrito con ${cantidadTotal} productos`}
          onClick={cerrarMenu}
        >
          <ShoppingCart size={21} />

          {cantidadTotal > 0 && (
            <span className={styles.cartCount}>
              {cantidadTotal}
            </span>
          )}
        </Link>

        {/* BOTÓN RESPONSIVE */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={() =>
            setMenuAbierto((actual) => !actual)
          }
          aria-label={
            menuAbierto ? 'Cerrar menú' : 'Abrir menú'
          }
          aria-expanded={menuAbierto}
          aria-controls="navbar-navigation"
        >
          {menuAbierto ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>
    </header>
  );
}

export default Navbar;
