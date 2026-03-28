const express = require('express');
const router = express.Router();
const controller = require('./it-assets.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

router.post('/registrar', protegerRuta, controller.registrarEquipo);
router.get('/listar', protegerRuta, controller.listarEquipos);

module.exports = router;