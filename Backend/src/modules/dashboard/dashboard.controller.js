const dashboardService = require('./dashboard.service');

const obtenerDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardData();
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('[Error Dashboard]:', error);
    res.status(500).json({ error: 'Error al cargar los datos del Dashboard' });
  }
};

module.exports = { obtenerDashboard };