const express = require('express');
const router = express.Router();
const controller = require('./locations.controller');

router.post('/paises', controller.crearPais);
router.post('/ciudades', controller.crearCiudad);
router.post('/sedes', controller.crearSede);

module.exports = router;