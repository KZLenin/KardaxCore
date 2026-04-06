const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// Ruta: POST /api/maintenance/ordenes
router.post('/ordenes', protegerRuta, maintenanceController.crearOrden);

router.get('/ordenes', protegerRuta, maintenanceController.getOrdenes);

router.put('/ordenes/:id', protegerRuta, maintenanceController.actualizarOrden);

module.exports = router;