const express = require('express');
const router = express.Router();
const controller = require('./movements.controller');
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');


router.get('/search/:codigo', protegerRuta, controller.buscarPorCodigo);
router.get('/', protegerRuta, controller.getHistorialCompleto);


// POST /api/movements/registrar
router.post('/registrar', protegerRuta, controller.registrarMovimientoLogistico);




module.exports = router;