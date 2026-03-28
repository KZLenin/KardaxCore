const express = require('express');
const router = express.Router();
const controller = require('./movements.controller');

// Ruta: POST /api/movements/registrar
router.post('/registrar', controller.registrarMovimientoLogistico);

module.exports = router;