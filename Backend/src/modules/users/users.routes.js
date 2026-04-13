const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');

// Rutas de lectura (Cualquier usuario logueado con permisos, o solo admins, según decidas)
router.get('/roles', protegerRuta, soloRol('ADMIN'), controller.getRoles);
router.get('/', protegerRuta, soloRol('ADMIN'), controller.getUsuarios);

// Ruta de creación (ESTRICTAMENTE ADMIN)
router.post('/', protegerRuta, soloRol('ADMIN'), controller.crearUsuario);

router.put('/:id', protegerRuta, soloRol('ADMIN'), controller.actualizarUsuario);

module.exports = router;