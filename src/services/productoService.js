// client/src/services/productoService.js

// Leemos la URL base desde las variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL;

export const productoService = {
  
  // Función para obtener la lista de productos con filtros y paginación
  getProductos: async (paginaActual = 1, limite = 10, busqueda = '') => {
    try {
      let url = `${API_URL}/productos?page=${paginaActual}&limit=${limite}`;
      
      if (busqueda) {
        url += `&q=${busqueda}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error de red o del servidor al obtener productos');
      }

      return await response.json(); // Retorna el JSON (que incluye success, data y pagination)
      
    } catch (error) {
      console.error('Error en productoService.getProductos:', error);
      throw error; // Lanzamos el error para que el componente lo maneje
    }
  },

  // (Opcional) Ya podemos dejar preparada la función para cuando hagamos la página de detalle de 1 solo producto
    getProductoById: async (id) => {
        try {
        const response = await fetch(`${API_URL}/productos/${id}`);
        
        if (!response.ok) {
            throw new Error('No se pudo obtener el detalle del producto');
        }

        return await response.json(); // Devuelve { success: true, data: producto }
        } catch (error) {
        console.error('Error en productoService.getProductoById:', error);
        throw error;
        }
    }
};