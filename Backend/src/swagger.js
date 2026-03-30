const swaggerAutogen = require('swagger-autogen')();

// Información general de tu API
const doc = {
  info: {
    title: 'KardaxCore API',
    description: 'API para el sistema de gestión de inventarios y activos de SOI Soluciones',
    version: '1.0.0',
  },
  host: 'localhost:3000', // Cambia el puerto si tu backend usa otro
  schemes: ['http'],
  // Configuración para que Swagger entienda nuestro Token de seguridad
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Ingresa tu token con el prefijo "Bearer ". Ej: Bearer tu_token_aqui'
    }
  }
};

// El archivo que Swagger va a crear con toda la documentación
const outputFile = './swagger-output.json';

// El archivo principal donde conectas todas tus rutas de Express
const routes = ['./app.js']; 

// Generamos el archivo mágico
swaggerAutogen(outputFile, routes, doc);