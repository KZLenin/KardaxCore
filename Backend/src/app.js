const express = require('express');
const cors = require('cors');

// Inicializamos la aplicación de Express
const app = express();

// --- 1. Middlewares Globales ---
// Permite que tu frontend en React (que estará en otro puerto o dominio) pueda hacer peticiones
app.use(cors()); 
// Permite que el servidor entienda los datos JSON que le envíes en el body
app.use(express.json()); 

// --- 2. Rutas Base (Módulos) ---
// Aquí es donde iremos "enchufando" cada módulo conforme lo vayamos construyendo.
// Por ahora los dejamos comentados para que veas la estructura:

const inventoryRoutes = require('./modules/inventory/inventory.routes');
const locationRoutes = require('./modules/locations/locations.routes');


app.use('/api/inventory', inventoryRoutes);
app.use('/api/locations', locationRoutes);


// Ruta de salud (Healthcheck) - Ideal para el MVP para saber que el backend responde
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend del Kardex para SOI Soluciones está operativo 🟢' 
  });
});

// --- 3. Middleware Global de Manejo de Errores ---
// Si alguna ruta falla, el error cae aquí y no tumba el servidor
app.use((err, req, res, next) => {
  console.error('[Error Crítico]:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  });
});

// Exportamos la app "limpia", SIN arrancar el servidor
module.exports = app;