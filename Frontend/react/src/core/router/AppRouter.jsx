import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Importaremos las vistas (crearemos estos archivos en el siguiente paso)
import LoginView from '../../modules/auth/views/LoginView';
import Verificacion2FAView from '../../modules/auth/views/Verificacion2FAView';
import DashboardView from '../../modules/dashboard/views/DashboardView';
import MainLayout from '../layout/MainLayout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            1. RUTAS PÚBLICAS
            ========================================== */}
        <Route path="/login" element={<LoginView />} /> 
        <Route path="/2fa-verificacion" element={<Verificacion2FAView />} />
        {/* ==========================================
            2. RUTAS PROTEGIDAS (Solo con Token)
            ========================================== */}
        <Route element={<ProtectedRoute />}>
          {/* El MainLayout envuelve a todas las pantallas del sistema */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardView />} />
            {/* ¡Aquí iremos agregando las demás pantallas! */}
            {/* <Route path="/inventario" element={<InventarioView />} /> */}
            {/* <Route path="/hardware" element={<HardwareView />} /> */}
          </Route>
        </Route>

        {/* ==========================================
            3. RUTA POR DEFECTO (Catch-all)
            ========================================== */}
        {/* Si escriben cualquier locura en la URL, los mandamos al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;