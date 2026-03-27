// Cargamos las variables de entorno (como el puerto o la URL de Supabase)
require('dotenv').config();

// Importamos la aplicación configurada
const app = require('./app');

// Definimos el puerto (usa el del .env, o el 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Arrancamos el motor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Buenas prácticas: Manejo elegante de apagado (Graceful shutdown)
// Si reinicias el servidor o lo apagas, cerramos las conexiones limpiamente
process.on('SIGINT', () => {
  console.log('🛑 Apagando el servidor de forma segura...');
  server.close(() => {
    console.log('Servidor cerrado. ¡Nos vemos!');
    process.exit(0);
  });
});