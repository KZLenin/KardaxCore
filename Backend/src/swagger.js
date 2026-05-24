const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Kardax Core API — SOI Soluciones',
    description: 'API automatizada del sistema ERP Kardex Core. Incluye los módulos de inventario inteligente de GymTech, control de activos IT y autenticación segura.',
    version: '1.1.0', // Subimos la versión del sistema
  },
  host: 'localhost:5000', // 🔥 Corregido al puerto real de tu backend
  basePath: '/',
  schemes: ['http'],
  // Configuración limpia y profesional para el candado JWT en la UI
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Ingresa tu token JWT con el formato: "Bearer <tu_token_aqui>"'
    }
  }
};

const outputFile = './swagger-output.json';

// 🔥 RECOMENDACIÓN: Si tus rutas están particionadas en subcarpetas, es mejor apuntar 
// al archivo raíz de Express (app.js o server.js) para que herede todo el árbol de rutas.
const routes = ['./app.js']; 

// Generamos el archivo dinámico
swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log("✅ swagger-output.json actualizado correctamente.");
});