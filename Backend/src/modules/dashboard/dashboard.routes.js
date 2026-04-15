const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const { protegerRuta } = require('../../core/middlewares/auth.middleware');

// GET /api/dashboard
router.get('/', protegerRuta, controller.obtenerDashboard);

module.exports = router;