const express = require('express');
const router = express.Router();
const controller = require('./client.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// Rutas base: /api/clientes (O como lo configures en tu app.js/server.js)
router.get('/', protegerRuta, controller.getClientes);
router.post('/', protegerRuta, controller.crearCliente);
router.put('/:id', protegerRuta, controller.actualizarCliente);
module.exports = router;