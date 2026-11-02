
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ rolesPermitidos = [] }) {
  const { usuario, autenticado, loading } = useAuth();
  const location = useLocation();

  // Esperar a que AuthContext verifique la sesión
  if (loading) {
    return (
      <div
        role="status"
        style={{ textAlign: 'center', padding: '50px' }}
      >
        Verificando sesión...
      </div>
    );
  }

  // Si no inició sesión, enviarlo al Login
  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Verificar si tiene el rol necesario
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario?.rol)
  ) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Mostrar la ruta protegida
  return <Outlet />;
}

export default ProtectedRoute;
