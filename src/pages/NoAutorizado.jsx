
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

function NoAutorizado() {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '30px',
        textAlign: 'center'
      }}
    >
      <ShieldX size={65} color="#f87171" />

      <h1>Acceso no autorizado</h1>

      <p style={{ color: '#94a3b8' }}>
        No tenés permisos para acceder a esta sección.
      </p>

      <Link
        to="/"
        style={{
          padding: '12px 22px',
          background: '#00b8ff',
          color: '#071827',
          borderRadius: '8px',
          fontWeight: '700'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NoAutorizado;
