import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import authService from '../../modules/auth/services/auth.service';

const MainLayout = () => {
  const [usuario, setUsuario] = useState({ nombre: '', rol: '' });
  const navigate = useNavigate();

  // Cargamos los datos del usuario logueado para mostrarlos en el Topbar
  useEffect(() => {
    const userStr = localStorage.getItem('kardax_user');
    if (userStr) {
      setUsuario(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR FIJO --- */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 bg-slate-900 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">KardaxCore</h1>
          <p className="text-xs text-slate-400 mt-1">SOI Soluciones</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Usamos Link de React Router para navegar sin recargar la página */}
          <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-700 focus:bg-blue-600">
            Inicio (Dashboard)
          </Link>
          <Link to="/inventario" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-700 focus:bg-blue-600">
            📦 Inventario General
          </Link>
          <Link to="/hardware" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-700 focus:bg-blue-600">
            🖨️ Escáner & Etiquetas
          </Link>
          <Link to="/usuarios" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-700 focus:bg-blue-600">
            👥 Usuarios
          </Link>
        </nav>

        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full text-left text-red-400 hover:text-red-300 flex items-center transition-colors">
            <span className="mr-2">🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR FIJO */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-medium text-gray-800">Panel de Control</h2>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="text-sm font-semibold text-gray-700">{usuario.nombre}</p>
              <p className="text-xs text-blue-500 font-medium">{usuario.rol}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200">
              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* AQUÍ OCURRE LA MAGIA: El contenido dinámico se inyecta aquí */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
};

export default MainLayout;