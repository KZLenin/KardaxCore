const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');


router.get('/historial', salesController.getHistorialVentas);

// Ruta POST: /api/ventas/registrar
router.post('/registrar', protegerRuta, salesController.registrarVenta);

module.exports = router;