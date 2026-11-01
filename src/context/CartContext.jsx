
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

// Contexto compartido por toda la aplicación
const CartContext = createContext(null);

const STORAGE_KEY = 'computech_carrito';

// Recuperar el carrito guardado en el navegador
function cargarCarrito() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    const datos = guardado ? JSON.parse(guardado) : [];

    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito);

  // Guardar cambios del carrito
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Agregar un producto o aumentar su cantidad
  const agregarProducto = (producto) => {
    if (!producto?._id || producto.stock <= 0) {
      return;
    }

    setItems((anteriores) => {
      const existente = anteriores.find(
        (item) => item._id === producto._id
      );

      if (existente) {
        if (existente.cantidad >= producto.stock) {
          return anteriores;
        }

        return anteriores.map((item) =>
          item._id === producto._id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                stock: producto.stock
              }
            : item
        );
      }

      return [
        ...anteriores,
        {
          _id: producto._id,
          nombre: producto.nombre,
          precio: producto.precio,
          stock: producto.stock,
          imagen: producto.imagenes?.[0] || null,
          cantidad: 1
        }
      ];
    });
  };

  // Modificar la cantidad desde el carrito
  const actualizarCantidad = (id, cantidad) => {
    setItems((anteriores) =>
      anteriores.map((item) => {
        if (item._id !== id) return item;

        const nuevaCantidad = Math.max(
          1,
          Math.min(item.stock, Math.trunc(Number(cantidad) || 1))
        );

        return {
          ...item,
          cantidad: nuevaCantidad
        };
      })
    );
  };

  // Quitar un producto
  const eliminarProducto = (id) => {
    setItems((anteriores) =>
      anteriores.filter((item) => item._id !== id)
    );
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    setItems([]);
  };

  // Calcular valores derivados
  const cantidadTotal = useMemo(
    () => items.reduce(
      (total, item) => total + item.cantidad,
      0
    ),
    [items]
  );

  const precioTotal = useMemo(
    () => items.reduce(
      (total, item) =>
        total + item.precio * item.cantidad,
      0
    ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        agregarProducto,
        actualizarCantidad,
        eliminarProducto,
        vaciarCarrito,
        cantidadTotal,
        precioTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para utilizar el carrito
export function useCart() {
  const contexto = useContext(CartContext);

  if (!contexto) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider'
    );
  }

  return contexto;
}
