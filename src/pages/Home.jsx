// client/src/pages/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bienvenido a la Tienda de Insumos Tecnológicos</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Encuentra los mejores componentes para armar tu PC ideal.
      </p>
      
      {/* Un botón que te lleva al catálogo */}
      <Link to="/productos">
        <button style={{ padding: '10px 20px', fontSize: '1.1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Ver Catálogo
        </button>
      </Link>
    </div>
  );
};

export default Home;