const express = require('express');
const router = express.Router();
const controller = require('./client.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// ==========================================
// RUTAS DE EMPRESA (/api/clientes)
// ==========================================
router.get('/', protegerRuta, controller.getEmpresas);
router.post('/', protegerRuta, controller.crearEmpresa);
router.put('/:id', protegerRuta, controller.editarEmpresa);

// ==========================================
// RUTAS DE SUCURSALES
router.get('/sucursales/todas', protegerRuta, controller.getAllSucursales);
// ==========================================
// Crear una sucursal para una empresa específica
router.post('/:empresaId/sucursales', protegerRuta, controller.crearSucursal);
router.get('/:empresaId/sucursales', protegerRuta, controller.getSucursales);
router.put('/sucursales/:idSucursal', protegerRuta, controller.editarSucursal);

module.exports = router;