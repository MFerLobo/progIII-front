
const API_URL = import.meta.env.VITE_API_URL;

async function solicitar(ruta, opciones = {}, token) {
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

export const inventarioService = {
  obtenerProductos: (pagina = 1, busqueda = '') => {
    const params = new URLSearchParams({
      page: String(pagina),
      limit: '10',
      sortBy: 'nombre',
      order: 'asc'
    });

    if (busqueda) {
      params.set('q', busqueda);
    }

    return solicitar(`/productos?${params}`);
  },

  actualizarPrecio: (id, precio, token) =>
    solicitar(
      `/productos/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ precio })
      },
      token
    ),

  actualizarStock: (id, cantidad, token) =>
    solicitar(
      `/productos/${id}/stock`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          cantidad,
          operacion: 'set'
        })
      },
      token
    )
};

