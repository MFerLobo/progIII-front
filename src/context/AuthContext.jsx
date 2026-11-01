
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'computech_token';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  // Comprobar sesión al abrir o recargar la web
  useEffect(() => {
    let activo = true;

    const verificarSesion = async () => {
      if (!token) {
        if (activo) {
          setUsuario(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const respuesta = await authService.perfil(token);

        if (activo) {
          setUsuario(respuesta.data || respuesta.usuario);
        }
      } catch {
        if (activo) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUsuario(null);
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    verificarSesion();

    return () => {
      activo = false;
    };
  }, [token]);

  // Iniciar sesión
  const login = async (credenciales) => {
    const respuesta = await authService.login(credenciales);

    if (!respuesta.token || !respuesta.usuario) {
      throw new Error('Respuesta de login incompleta');
    }

    localStorage.setItem(TOKEN_KEY, respuesta.token);
    setUsuario(respuesta.usuario);
    setToken(respuesta.token);

    return respuesta.usuario;
  };

  // Registrar un nuevo cliente
  const registro = async (datos) => {
    const respuesta = await authService.registro(datos);

    if (!respuesta.token || !respuesta.usuario) {
      throw new Error('Respuesta de registro incompleta');
    }

    localStorage.setItem(TOKEN_KEY, respuesta.token);
    setUsuario(respuesta.usuario);
    setToken(respuesta.token);

    return respuesta.usuario;
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        autenticado: Boolean(usuario && token),
        login,
        registro,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return contexto;
}
