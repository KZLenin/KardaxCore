const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');


router.get('/historial', salesController.getHistorialVentas);
router.get('/:id', protegerRuta, salesController.getDetalleVenta);
router.get('/:id/pdf', protegerRuta, salesController.descargarPDF);
// Ruta POST: /api/ventas/registrar
router.post('/registrar', protegerRuta, salesController.registrarVenta);

module.exports = router;