const express = require('express');
const multer = require('multer');

const router = express.Router();
const inventoryController = require('./inventory.controller');


// Importamos a nuestro guardia
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por foto para no reventar tu nube
});


router.post('/entrada', protegerRuta, soloRol('ADMIN'), inventoryController.registrarEntrada);
router.post('/categorias', protegerRuta, soloRol('ADMIN'), inventoryController.crearCategoria);
router.post('/proveedores', protegerRuta, inventoryController.registrarProveedor);
router.post('/etiquetas/masivo', protegerRuta, inventoryController.descargarEtiquetasMasivas);
router.post('/:id/imagen', protegerRuta, upload.single('imagen'), inventoryController.subirImagen);
router.post('/exportar', protegerRuta, inventoryController.exportarInventarioExcel);
router.post('/importar-masivo', protegerRuta, inventoryController.importarMasivo);

router.get('/categorias', protegerRuta, inventoryController.getCategorias);
router.get('/proveedores', protegerRuta, inventoryController.getProveedores);
router.get('/', protegerRuta, inventoryController.getInventario);
router.get('/:id/historial', protegerRuta, inventoryController.getHistorial);
router.get('/:id/etiquetas', protegerRuta, inventoryController.descargarEtiquetas);
router.get('/sedes', protegerRuta, inventoryController.getSedes);

router.put('/categorias/:id', protegerRuta, soloRol('ADMIN'), inventoryController.actualizarCategoria);
router.put('/proveedores/:id', protegerRuta, soloRol('ADMIN'), inventoryController.actualizarProveedor);
router.put('/:id', protegerRuta, soloRol('ADMIN'), inventoryController.actualizarEquipo);
module.exports = router;