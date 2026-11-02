
import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkoutService } from '../services/checkoutService';

import styles from './Checkout.module.css';

const formatearPrecio = (precio) =>
  Number(precio || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS'
  });

function Checkout() {
  const { usuario, token } = useAuth();

  const {
    items,
    cantidadTotal,
    precioTotal,
    vaciarCarrito
  } = useCart();

  const [direccion, setDireccion] = useState(() => ({
    calle: usuario?.direccion?.calle || '',
    ciudad: usuario?.direccion?.ciudad || '',
    provincia: usuario?.direccion?.provincia || '',
    codigoPostal: usuario?.direccion?.codigoPostal || ''
  }));

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [ordenCreada, setOrdenCreada] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDireccion((actual) => ({
      ...actual,
      [name]: value
    }));
  };

  const confirmarCompra = async (e) => {
    e.preventDefault();

    if (procesando || items.length === 0) return;

    const direccionLimpia = Object.fromEntries(
      Object.entries(direccion).map(([campo, valor]) => [
        campo,
        valor.trim()
      ])
    );

    if (Object.values(direccionLimpia).some((valor) => !valor)) {
      setError('Completá todos los campos de la dirección.');
      return;
    }

    const datosOrden = {
      items: items.map((item) => ({
        productoId: item._id,
        cantidad: item.cantidad
      })),
      metodoPago: 'transferencia',
      direccionEnvio: direccionLimpia
    };

    setProcesando(true);
    setError('');

    try {
      const orden = await checkoutService.crearOrden(
        datosOrden,
        token
      );

      // Solo se vacía el carrito cuando la API
      // confirma que se creó la orden.
      setOrdenCreada(orden);
      vaciarCarrito();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // COMPRA REALIZADA
  if (ordenCreada) {
    return (
      <div className={styles.container}>
        <section className={styles.successCard}>
          <CheckCircle2 size={68} />

          <h1>¡Compra realizada!</h1>

          <p>
            Tu pedido se registró correctamente.
            Podés consultar su estado desde Mis compras.
          </p>

          {(ordenCreada._id || ordenCreada.id) && (
            <span className={styles.orderNumber}>
              Pedido #{String(
                ordenCreada._id || ordenCreada.id
              ).slice(-8).toUpperCase()}
            </span>
          )}

          <Link
            to="/mis-compras"
            className={styles.primaryButton}
          >
            Ver mis compras
          </Link>

          <Link
            to="/productos"
            className={styles.secondaryLink}
          >
            Seguir comprando
          </Link>
        </section>
      </div>
    );
  }

  // CARRITO VACÍO
  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <section className={styles.emptyCard}>
          <ShoppingBag size={52} />

          <h1>No hay productos para comprar</h1>

          <p>
            Agregá productos al carrito antes
            de finalizar una compra.
          </p>

          <Link
            to="/productos"
            className={styles.primaryButton}
          >
            Explorar productos
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/carrito" className={styles.backLink}>
          <ArrowLeft size={18} />
          Volver al carrito
        </Link>

        <h1>
          <ShoppingBag size={30} />
          Finalizar compra
        </h1>

        <p>
          Confirmá tus datos para registrar el pedido.
        </p>
      </header>

      <form
        className={styles.layout}
        onSubmit={confirmarCompra}
      >
        <div className={styles.formColumn}>

          {/* DATOS DEL CLIENTE */}
          <section className={styles.card}>
            <h2>
              <Package size={21} />
              Datos del comprador
            </h2>

            <div className={styles.buyerInfo}>
              <p>
                <strong>Nombre:</strong> {usuario?.nombre}
              </p>

              <p>
                <strong>Email:</strong> {usuario?.email}
              </p>
            </div>
          </section>

          {/* DIRECCIÓN */}
          <section className={styles.card}>
            <h2>
              <MapPin size={21} />
              Dirección de envío
            </h2>

            <div className={styles.fields}>
              <label className={styles.fullWidth}>
                Calle y número
                <input
                  type="text"
                  name="calle"
                  value={direccion.calle}
                  onChange={handleChange}
                  placeholder="Ej. Av. Rivadavia 4500"
                  required
                  disabled={procesando}
                />
              </label>

              <label>
                Ciudad
                <input
                  type="text"
                  name="ciudad"
                  value={direccion.ciudad}
                  onChange={handleChange}
                  placeholder="Ej. CABA"
                  required
                  disabled={procesando}
                />
              </label>

              <label>
                Provincia
                <input
                  type="text"
                  name="provincia"
                  value={direccion.provincia}
                  onChange={handleChange}
                  placeholder="Ej. Buenos Aires"
                  required
                  disabled={procesando}
                />
              </label>

              <label className={styles.fullWidth}>
                Código postal
                <input
                  type="text"
                  name="codigoPostal"
                  value={direccion.codigoPostal}
                  onChange={handleChange}
                  placeholder="Ej. C1405"
                  required
                  disabled={procesando}
                />
              </label>
            </div>
          </section>

          {/* PAGO */}
          <section className={styles.card}>
            <h2>
              <CreditCard size={21} />
              Método de pago
            </h2>

            <div className={styles.paymentMethod}>
              <input
                type="radio"
                name="metodoPago"
                checked
                readOnly
              />

              <div>
                <strong>Transferencia bancaria</strong>
                <p>Pago simulado para este proyecto.</p>
              </div>
            </div>

            <p className={styles.paymentNote}>
              No se realizará ningún cobro real.
              La compra se registrará en el sistema
              con estado pendiente.
            </p>
          </section>
        </div>

        {/* RESUMEN */}
        <aside className={styles.summary}>
          <h2>Resumen del pedido</h2>

          <div className={styles.items}>
            {items.map((item) => (
              <div
                key={item._id}
                className={styles.summaryItem}
              >
                <div>
                  <strong>{item.nombre}</strong>
                  <small>Cantidad: {item.cantidad}</small>
                </div>

                <span>
                  {formatearPrecio(
                    item.precio * item.cantidad
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Productos ({cantidadTotal})</span>
            <span>{formatearPrecio(precioTotal)}</span>
          </div>

          <div className={styles.totalRow}>
            <span>Total estimado</span>
            <strong>
              {formatearPrecio(precioTotal)}
            </strong>
          </div>

          <p className={styles.note}>
            El backend verificará el stock y
            recalculará el total con los precios actuales.
          </p>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={procesando}
          >
            <CheckCircle2 size={19} />
            {procesando
              ? 'Confirmando compra...'
              : 'Confirmar compra'}
          </button>

          <Link
            to="/carrito"
            className={styles.secondaryLink}
          >
            Revisar carrito
          </Link>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;
