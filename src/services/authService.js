
const API_URL = import.meta.env.VITE_API_URL;

async function solicitar(ruta, opciones = {}) {
  const response = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...opciones.headers
    }
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.message || 'Ocurrió un error en el servidor'
    );
  }

  return json;
}

export const authService = {
  login: (credenciales) =>
    solicitar('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales)
    }),

  registro: (datos) =>
    solicitar('/auth/register', {
      method: 'POST',
      body: JSON.stringify(datos)
    }),

  perfil: (token) =>
    solicitar('/auth/perfil', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
};
