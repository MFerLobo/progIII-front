
const API_URL = import.meta.env.VITE_API_URL;

export const checkoutService = {
  crearOrden: async (datos, token) => {
    const response = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });

    const respuesta = await response.json();

    if (!response.ok || !respuesta.success) {
      throw new Error(
        respuesta.message || 'No se pudo confirmar la compra.'
      );
    }

    return respuesta.data;
  }
};
