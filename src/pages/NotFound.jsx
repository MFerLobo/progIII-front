
import { Link } from 'react-router-dom';
import { MonitorX, House } from 'lucide-react';

import styles from './NotFound.module.css';

function NotFound() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>

        <div className={styles.iconContainer}>
          <MonitorX size={55} strokeWidth={1.5} />
        </div>

        <h1 className={styles.errorCode}>404</h1>

        <h2>Página no encontrada</h2>

        <p>
          Parece que la dirección que buscás no existe,
          fue modificada o ya no está disponible.
        </p>

        <div className={styles.actions}>
          <Link
            to="/"
            className={styles.primaryButton}
          >
            <House size={18} />
            Volver al inicio
          </Link>
        </div>

      </div>
    </section>
  );
}

export default NotFound;
