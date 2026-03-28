const express = require('express');
const cors = require('cors');

// Inicializamos la aplicación de Express
const app = express();

// --- 1. Middlewares Globales ---
// Permite que tu frontend (React/Vite, Postman) pueda hacer peticiones
app.use(cors()); 
// Permite que el servidor entienda los datos JSON que le envíes en el body
app.use(express.json()); 

// --- 2. Rutas Base (Módulos) ---
// Importamos todos los enrutadores de nuestros módulos
const authRoutes = require('./modules/auth/auth.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const locationRoutes = require('./modules/locations/locations.routes');
const movementRoutes = require('./modules/movements/movements.routes');
const itAssetsRoutes = require('./modules/it-assets/it-assets.routes');

// Enchufamos las rutas a la API
app.use('/api/auth', authRoutes);               // Login, Registro, 2FA, Recuperación
app.use('/api/inventory', inventoryRoutes);     // Kardex, Categorías, Proveedores
app.use('/api/locations', locationRoutes);      // Sedes, Ciudades, Países
app.use('/api/movements', movementRoutes);      // Ventas, Traslados (Logística)
app.use('/api/it-assets', itAssetsRoutes);      // Fichas técnicas exclusivas de TI


// --- Ruta de salud (Healthcheck) ---
// Ideal para saber que el backend responde en el servidor de SOI Soluciones
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend de SOI Core está operativo 🟢' 
  });
});

// --- 3. Middleware Global de Manejo de Errores ---
// Si alguna ruta falla, el error cae aquí y no tumba el servidor
app.use((err, req, res, next) => {
  console.error('[Error Crítico]:', err.stack); // Cambié a err.stack para que veas la línea exacta si algo falla
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  });
});

// Exportamos la app "limpia", SIN arrancar el servidor (server.js se encarga de eso)
module.exports = app;