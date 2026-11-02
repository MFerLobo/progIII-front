
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

export const pedidoService = {
  obtenerPedidos: (token, pagina = 1, estado = '') => {
    const params = new URLSearchParams({
      page: String(pagina),
      limit: '10'
    });

    if (estado) {
      params.set('estado', estado);
    }

    return solicitar(`/ordenes?${params.toString()}`, token);
  },

  obtenerPedidoPorId: (id, token) =>
    solicitar(`/ordenes/${id}`, token),

  actualizarEstado: (id, estado, token) =>
    solicitar(`/ordenes/${id}/estado`, token, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
    })
};
