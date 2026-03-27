const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');

// Definimos que cuando alguien haga un POST a esta ruta, el controlador se haga cargo
// La ruta completa será: POST /api/inventory/entrada
router.post('/entrada', inventoryController.registrarEntrada);
router.post('/categorias', inventoryController.crearCategoria);

// En el futuro, aquí agregaremos más rutas, como:
// router.get('/listar', inventoryController.listarKardex);
// router.post('/salida', inventoryController.registrarSalida);

module.exports = router;