const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');
const upload = require('../../core/middlewares/upload.middleware');
// Ruta: POST /api/maintenance/ordenes
router.post('/ordenes', protegerRuta, upload.single('foto_ingreso'), maintenanceController.crearOrden);

router.get('/ordenes', protegerRuta, maintenanceController.getOrdenes);
router.get('/scanner-lookup/:codigo', protegerRuta, maintenanceController.getEquipoScanner);

router.put('/ordenes/:id', protegerRuta, upload.single('foto_ingreso'),maintenanceController.actualizarOrden);

module.exports = router;