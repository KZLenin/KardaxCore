const express = require('express');
const router = express.Router();
const quotesController = require('./quotes.controller');

// Importamos a tu guardia 
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// Endpoint para recibir la orden y generar la cotización inicial
router.post('/importar', protegerRuta, quotesController.generarCotizacion);

// Endpoint para listar todas las cotizaciones
router.get('/', protegerRuta, quotesController.getCotizaciones);

// Endpoint para obtener detalles de una cotización específica
router.get('/:id', protegerRuta, quotesController.getCotizacionPorId);

// Endpoint para generar y descargar la Proforma en PDF
router.get('/:id/pdf', protegerRuta, quotesController.descargarProformaPDF);

// Endpoint para actualizar una cotización (notas, estados manuales)
router.put('/:id', protegerRuta, quotesController.actualizarCotizacion);

// Endpoint core: Transforma los repuestos aceptados en una VENTA real
router.post('/:id/aprobar', protegerRuta, quotesController.procesarAprobacionCotizacion);

module.exports = router;