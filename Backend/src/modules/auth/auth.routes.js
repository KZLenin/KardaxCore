const express = require('express');
const router = express.Router();

// Importamos el controlador con todas sus funciones
const authController = require('./auth.controller');

// Importamos a nuestro "Guardia de Seguridad"
const { protegerRuta, soloRol } = require('../../core/middlewares/auth.middleware');

// ==========================================
// 1. RUTAS PÚBLICAS (No requieren Token)
// ==========================================

// Login normal (Devuelve token o pide 2FA)
router.post('/login', authController.login);

// El usuario olvidó su clave y pide que le envíen el correo
router.post('/recuperar-password', authController.solicitarRecuperacion);


// ==========================================
// 2. RUTAS DE SEGURIDAD (TOTP / Authenticator)
// ==========================================

// Genera el código QR para que el usuario lo escanee la primera vez
// (Debe tener un token válido básico para poder generar su propio QR)
router.post('/2fa/configurar', protegerRuta, authController.configurar2FA);


// ==========================================
// 3. RUTAS PROTEGIDAS (Requieren Token válido)
// ==========================================

// El usuario hace clic en el enlace de su correo, React recibe un token temporal,
// lo manda en los headers, y el guardia (protegerRuta) lo deja pasar para cambiar la clave.
router.post('/cambiar-password', protegerRuta, authController.cambiarPassword);


// ==========================================
// 4. RUTAS ADMINISTRATIVAS (Requieren Token + Rol Específico)
// ==========================================

// Solo tú (o alguien con rol ADMIN) puede crear cuentas nuevas para los bodegueros y técnicos
router.post('/registrar', protegerRuta, soloRol('ADMIN'), authController.registrarUsuario);
router.get('/usuarios', protegerRuta, soloRol('ADMIN'), authController.getUsuarios);

module.exports = router;