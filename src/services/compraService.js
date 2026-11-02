const API_URL = import.meta.env.VITE_API_URL;

async function solicitar(ruta, token) {
  const response = await fetch(`${API_URL}${ruta}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.message || 'No se pudo realizar la consulta'
    );
  }

  return json;
}

export const compraService = {
  obtenerMisCompras: (token) =>
    solicitar('/ordenes/mis-compras', token),

  obtenerDetalle: (id, token) =>
    solicitar(`/ordenes/${id}`, token)
};
