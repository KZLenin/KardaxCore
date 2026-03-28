import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-soi-light">
      
      {/* SIDEBAR (Barra Lateral) */}
      <aside className="w-64 bg-soi-navy text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          <span className="text-soi-primary">SOI</span> Core
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Aquí luego agregaremos iconos más bonitos con lucide-react */}
          <Link to="/" className="block p-3 rounded hover:bg-soi-primaryHover transition">
            Dashboard
          </Link>
          <Link to="/inventario" className="block p-3 rounded hover:bg-soi-primaryHover transition">
            Kardex
          </Link>
          <Link to="/logistica" className="block p-3 rounded hover:bg-soi-primaryHover transition">
            Logística
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          Usuario Sede Quito
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-soi-border flex items-center px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Sistema de Gestión</h1>
        </header>

        {/* CONTENIDO DINÁMICO (Aquí se inyectan las demás pantallas) */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* <-- Esto es clave. Aquí React Router dibuja las páginas */}
        </main>
      </div>

    </div>
  );
};

export default MainLayout;