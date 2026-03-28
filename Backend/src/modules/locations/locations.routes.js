const express = require('express');
const router = express.Router();
const controller = require('./locations.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

router.post('/paises', controller.crearPais);
router.post('/ciudades', controller.crearCiudad);
router.post('/sedes', controller.crearSede);

router.get('/paises', protegerRuta, controller.getPaises);
router.get('/ciudades', protegerRuta, controller.getCiudades);
router.get('/sedes', protegerRuta, controller.getSedes);

module.exports = router;