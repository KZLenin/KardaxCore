const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');

// Importamos a nuestro guardia
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');



router.post('/entrada', protegerRuta, soloRol('LOGISTICA'), inventoryController.registrarEntrada);
router.post('/categorias', protegerRuta, soloRol('ADMIN'), inventoryController.crearCategoria);
router.post('/proveedores', protegerRuta, inventoryController.registrarProveedor);

router.get('/categorias', protegerRuta, inventoryController.getCategorias);
router.get('/proveedores', protegerRuta, inventoryController.getProveedores);

module.exports = router;