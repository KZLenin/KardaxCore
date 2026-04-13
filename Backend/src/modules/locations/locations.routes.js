const express = require('express');
const router = express.Router();
const controller = require('./locations.controller');
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');

router.post('/paises', soloRol('ADMIN'), controller.crearPais);
router.post('/ciudades', soloRol('ADMIN'), controller.crearCiudad);
router.post('/sedes', soloRol('ADMIN'), controller.crearSede);

router.get('/paises', protegerRuta, controller.getPaises);
router.get('/ciudades', protegerRuta, controller.getCiudades);
router.get('/sedes', protegerRuta, controller.getSedes);

// Añade estas líneas debajo de tus rutas GET
router.put('/paises/:id', protegerRuta, soloRol('ADMIN'), controller.actualizarPais);
router.put('/ciudades/:id', protegerRuta, soloRol('ADMIN'), controller.actualizarCiudad);
router.put('/sedes/:id', protegerRuta, soloRol('ADMIN'), controller.actualizarSede);

module.exports = router;