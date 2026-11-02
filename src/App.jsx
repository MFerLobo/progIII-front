import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';
import NoAutorizado from './pages/NoAutorizado';
import Inventario from './pages/Inventario';
import Pedidos from './pages/Pedidos';
import AdminUsuarios from './pages/AdminUsuarios';
import Perfil from './pages/Perfil';
import MisCompras from './pages/MisCompras';
import Checkout from './pages/Checkout';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>

          <Navbar />

          <main>
            <Routes>

              {/* RUTAS PÚBLICAS */}
              <Route path="/" element={<Home />} />

              <Route
                path="/productos"
                element={<Productos />}
              />

              <Route
                path="/productos/:id"
                element={<DetalleProducto />}
              />

              <Route path="/carrito" element={<Carrito />} />

              <Route path="/login" element={<Login />} />

              <Route
                path="/registro"
                element={<Registro />}
              />

              <Route
                path="/no-autorizado"
                element={<NoAutorizado />}
              />


              {/* PERFIL - TODOS LOS AUTENTICADOS */}
              <Route element={<ProtectedRoute />}>
                <Route path="/perfil" element={<Perfil />} />
              </Route>

              {/* CLIENTES */}
              <Route
                element={
                  <ProtectedRoute rolesPermitidos={['cliente']} />
                }
              >
                <Route
                  path="/mis-compras"
                  element={<MisCompras />}
                />
                <Route
                  path="/checkout"
                  element={<Checkout />}
                />
              </Route>

              {/* EMPLEADOS */}
              <Route
                element={
                  <ProtectedRoute rolesPermitidos={['empleado']} />
                }
              >
                <Route
                  path="/inventario"
                  element={<Inventario />}
                />

                <Route
                  path="/pedidos"
                  element={<Pedidos />}
                />
              </Route>

              {/* ADMINISTRADORES */}
              <Route
                element={
                  <ProtectedRoute rolesPermitidos={['admin']} />
                }
              >
                <Route
                  path="/admin/usuarios"
                  element={<AdminUsuarios />}
                />
              </Route>

            </Routes>
          </main>

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
