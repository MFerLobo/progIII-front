import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';


import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/productos" element={<Productos />} />

              <Route
                path="/productos/:id"
                element={<DetalleProducto />}
              />

              <Route path="/carrito" element={<Carrito />} />

              <Route path="/login" element={<Login />} />
              
              <Route path="/registro" element={<Registro />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
