const express = require('express');
const router = express.Router();
const multer = require('multer');

const controller = require('./configuration.controller');

// Asegúrate de que las rutas relativas a tus middlewares sean correctas según tu estructura
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // Máximo 2MB para el logo
});

// GET: Leer configuración (Cualquier usuario logueado la necesita para ver el logo)
router.get('/', protegerRuta, controller.getGeneral);

// PUT: Guardar Perfil (Solo Admin)
router.put('/perfil', protegerRuta, soloRol('ADMIN'), controller.updatePerfil);

// PUT: Guardar Inventario (Solo Admin)
router.put('/inventario', protegerRuta, soloRol('ADMIN'), controller.updateInventario);

// POST: Subir Logo (Solo Admin)
router.post('/logo', protegerRuta, soloRol('ADMIN'), upload.single('logo'), controller.uploadLogo);

module.exports = router;