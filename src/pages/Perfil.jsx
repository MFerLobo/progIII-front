
import { Link } from 'react-router-dom';

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import styles from './Perfil.module.css';

function Perfil() {
  const { usuario } = useAuth();

  const direccion = usuario?.direccion;

  const direccionTexto = direccion
    ? [
        direccion.calle,
        direccion.ciudad,
        direccion.provincia,
        direccion.codigoPostal
      ].filter(Boolean).join(', ')
    : '';

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <span className={styles.subtitle}>
          MI CUENTA
        </span>

        <h1>
          <UserRound size={30} />
          Mi perfil
        </h1>

        <p>
          Consultá tus datos registrados en COMPUTECH.
        </p>
      </header>

      <section className={styles.profileCard}>

        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <UserRound size={34} />
          </div>

          <div>
            <h2>{usuario?.nombre || 'Usuario'}</h2>

            <span className={styles.role}>
              {usuario?.rol || 'Sin rol'}
            </span>
          </div>
        </div>

        <div className={styles.infoGrid}>

          <div className={styles.infoItem}>
            <Mail size={20} />

            <div>
              <span>Correo electrónico</span>
              <strong>
                {usuario?.email || 'No disponible'}
              </strong>
            </div>
          </div>

          <div className={styles.infoItem}>
            <Phone size={20} />

            <div>
              <span>Teléfono</span>
              <strong>
                {usuario?.telefono || 'No registrado'}
              </strong>
            </div>
          </div>

          <div className={styles.infoItem}>
            <MapPin size={20} />

            <div>
              <span>Dirección</span>
              <strong>
                {direccionTexto || 'No registrada'}
              </strong>
            </div>
          </div>

          <div className={styles.infoItem}>
            <ShieldCheck size={20} />

            <div>
              <span>Tipo de cuenta</span>
              <strong>
                {usuario?.rol || 'No disponible'}
              </strong>
            </div>
          </div>

        </div>
      </section>

      {usuario?.rol === 'cliente' && (
        <section className={styles.purchasesCard}>
          <div>
            <h2>Mis compras</h2>
            <p>
              Revisá tus pedidos y el estado de cada envío.
            </p>
          </div>

          <Link
            to="/mis-compras"
            className={styles.purchasesButton}
          >
            <ShoppingBag size={18} />
            Ver mis compras
          </Link>
        </section>
      )}

    </div>
  );
}

export default Perfil;
