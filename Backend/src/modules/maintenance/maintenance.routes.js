const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');

// Ruta: POST /api/maintenance/ordenes
router.post('/ordenes', maintenanceController.crearOrden);

router.get('/ordenes', maintenanceController.getOrdenes);
module.exports = router;