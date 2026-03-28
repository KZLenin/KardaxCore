import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';

// Componentes "Falsos" temporales para ver que las rutas funcionen
const Dashboard = () => <div><h2 className="text-2xl font-bold">Bienvenido al Dashboard</h2><p>Aquí irán los gráficos.</p></div>;
const Inventario = () => <div><h2 className="text-2xl font-bold">Kardex Principal</h2><p>Aquí irá la tabla de equipos.</p></div>;
const Login = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold text-soi-navy">Pantalla de Login</h1><p>Pronto nos conectaremos al backend...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (Fuera del Layout) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas (Adentro del Layout con Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;