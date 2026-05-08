const billingService = require('./billing.service');

const getPendientes = async (req, res) => {
  try {
    const data = await billingService.obtenerPendientes();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generarFactura = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id; // Del middleware
    const factura = await billingService.generarFactura(req.body, usuarioId);
    res.status(201).json({ mensaje: 'Factura generada y órdenes enlazadas', data: factura });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCartera = async (req, res) => {
  try {
    const data = await billingService.obtenerCartera();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarAbono = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params; // ID de la factura
    const resultado = await billingService.registrarAbono(id, req.body, usuarioId);
    res.status(201).json({ mensaje: 'Pago registrado con éxito', data: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPendientes,
  generarFactura,
  getCartera,
  registrarAbono
};