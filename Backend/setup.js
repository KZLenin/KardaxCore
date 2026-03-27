const fs = require('fs');

// 1. Definimos las carpetas que necesitamos
const carpetas = [
  'src/config',
  'src/core/errors',
  'src/core/middlewares',
  'src/modules/inventory',
  'src/modules/locations',
  'src/modules/hardware/services'
];

// 2. Definimos los archivos base de la Arquitectura Limpia
const archivos = [
  '.env',
  'src/server.js',
  'src/app.js',
  'src/config/supabase.js',
  'src/modules/inventory/inventory.routes.js',
  'src/modules/inventory/inventory.controller.js',
  'src/modules/inventory/inventory.service.js',
  'src/modules/inventory/inventory.repository.js',
  'src/modules/locations/locations.routes.js',
  'src/modules/locations/locations.controller.js',
  'src/modules/locations/locations.service.js',
  'src/modules/locations/locations.repository.js',
  'src/modules/hardware/printer.controller.js',
  'src/modules/hardware/services/printer.factory.js',
  'src/modules/hardware/services/cromePrinter.js'
];

// 3. Ejecutamos la creación
console.log('Construyendo la arquitectura para SOI Soluciones...');

try {
  carpetas.forEach(carpeta => fs.mkdirSync(carpeta, { recursive: true }));
  archivos.forEach(archivo => fs.writeFileSync(archivo, ''));
  console.log('¡Estructura creada con éxito, Lenin! 🚀');
} catch (error) {
  console.error('Hubo un error armando la estructura:', error);
}