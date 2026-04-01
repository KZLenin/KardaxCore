import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Buscamos el token que guardó nuestro authService
  const isAuthenticated = localStorage.getItem('kardax_token');

  // Si no hay token, lo mandamos directo al login y reemplazamos el historial
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos la pantalla que estaba pidiendo (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;