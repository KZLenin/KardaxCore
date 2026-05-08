const express = require('express');
const router = express.Router();
const controller = require('./billing.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// Rutas de Facturación
router.get('/pendientes', protegerRuta, controller.getPendientes);
router.post('/generar', protegerRuta, controller.generarFactura);

// Rutas de Cartera y Cobros
router.get('/cartera', protegerRuta, controller.getCartera);
router.post('/:id/pagar', protegerRuta, controller.registrarAbono);

module.exports = router;