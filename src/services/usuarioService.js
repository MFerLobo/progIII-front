
const API_URL = import.meta.env.VITE_API_URL;

async function solicitar(ruta, token, opciones = {}) {
  const response = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...opciones.headers
    }
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.message || 'Error al procesar la solicitud'
    );
  }

  return json;
}

export const usuarioService = {
  obtenerUsuarios: (token, pagina = 1, rol = '', activo = '') => {
    const params = new URLSearchParams({
      page: String(pagina),
      limit: '10'
    });

    if (rol) params.set('rol', rol);
    if (activo !== '') params.set('activo', activo);

    return solicitar(`/usuarios?${params}`, token);
  },

  crearUsuario: (datos, token) =>
    solicitar('/usuarios', token, {
      method: 'POST',
      body: JSON.stringify(datos)
    }),

  actualizarUsuario: (id, datos, token) =>
    solicitar(`/usuarios/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(datos)
    }),

  desactivarUsuario: (id, token) =>
    solicitar(`/usuarios/${id}`, token, {
      method: 'DELETE'
    }),

  reactivarUsuario: (id, token) =>
  solicitar(`/usuarios/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify({ activo: true })
  })
};
