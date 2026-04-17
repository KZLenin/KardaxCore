const express = require('express');
const router = express.Router();
const controller = require('./movements.controller');
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

router.get('/search/:codigo', protegerRuta, controller.buscarPorCodigo);
router.get('/', protegerRuta, controller.getHistorialCompleto);


// POST /api/movements/registrar
router.post('/registrar', protegerRuta, controller.registrarMovimientoLogistico);
router.post('/:id/baja', protegerRuta, soloRol('ADMIN'), upload.single('evidencia'), movementsController.registrarBaja);



module.exports = router;