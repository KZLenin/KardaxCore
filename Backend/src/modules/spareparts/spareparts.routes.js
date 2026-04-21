const express = require('express');
const router = express.Router();
const sparepartsController = require('./spareparts.controller');

// Importamos a nuestro guardia de seguridad
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// GET /api/spareparts/ordenes/:ordenId
router.get('/ordenes/:ordenId', protegerRuta, sparepartsController.getRepuestosPorOrden);

// POST /api/spareparts/ordenes/:ordenId
router.post('/ordenes/:ordenId', protegerRuta, sparepartsController.agregarRepuesto);

module.exports = router;