import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut
} from 'lucide-react';

import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const { cantidadTotal } = useCart();
  const { usuario, autenticado, logout } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleBuscar = (e) => {
    e.preventDefault();

    const termino = busqueda.trim();

    if (termino) {
      navigate(`/productos?q=${encodeURIComponent(termino)}`);
      setMenuAbierto(false);
    }
  };

  return (
    <header className={styles.navbar}>

      {/* Logo */}
      <Link to="/" className={styles.logo}>
        <span className={styles.logoAccent}>COMPU</span>
        TECH
      </Link>

      {/* Navegación */}
      <nav
        className={`${styles.navLinks} ${menuAbierto ? styles.navLinksOpen : ''
          }`}
      >
        <NavLink
          to="/"
          end
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) =>
            isActive ? styles.active : ''
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/productos"
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) =>
            isActive ? styles.active : ''
          }
        >
          Productos
        </NavLink>
      </nav>

      {/* Buscador */}
      <form
        className={styles.searchContainer}
        onSubmit={handleBuscar}
        role="search"
      >
        <Search size={19} />

        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos"
        />
      </form>

      {/* Acciones */}
      <div className={styles.actions}>

        {/* Perfil: se habilitará con autenticación */}

        {autenticado ? (
          <div className={styles.userActions}>
            <span className={styles.userName}>
              {usuario?.nombre}
            </span>

            <button
              type="button"
              className={styles.iconButton}
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={21} />
            </button>
          </div>
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


        {/* Carrito */}
        <Link
          to="/carrito"
          className={styles.cartButton}
          aria-label={`Carrito con ${cantidadTotal} productos`}
        >
          <ShoppingCart size={21} />

          {cantidadTotal > 0 && (
            <span className={styles.cartCount}>
              {cantidadTotal}
            </span>
          )}
        </Link>


        {/* Menú responsive */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
        >
          <Menu size={24} />
        </button>

      </div>
    </header>
  );
}

export default Navbar;
