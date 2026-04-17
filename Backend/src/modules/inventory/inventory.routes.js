const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');

// Importamos a nuestro guardia
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');



router.post('/entrada', protegerRuta, soloRol('ADMIN'), inventoryController.registrarEntrada);
router.post('/categorias', protegerRuta, soloRol('ADMIN'), inventoryController.crearCategoria);
router.post('/proveedores', protegerRuta, inventoryController.registrarProveedor);
router.post('/etiquetas/masivo', protegerRuta, inventoryController.descargarEtiquetasMasivas);
    
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