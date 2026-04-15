const repository = require('./dashboard.repository');

const getDashboardData = async () => {
  const { inventarioRaw, movimientosRaw, stockCriticoRaw, garantiasRaw } = await repository.obtenerEstadisticas();

  // --- 1. PROCESAR SALUD DEL INVENTARIO Y STOCK TOTAL ---
  let totalOperativo = 0;
  let totalTaller = 0;
  let totalAgotado = 0;
  let totalVendido = 0; // Opcional si quieres mostrarlo

  (inventarioRaw || []).forEach(item => {
    if (item.estado_operativo === 'Operativo') totalOperativo++;
    else if (item.estado_operativo === 'En Reparación') totalTaller++;
    else if (item.estado_operativo === 'Agotado/Baja') totalAgotado++;
    else if (item.estado_operativo === 'Vendido') totalVendido++;
  });

  const dataEstados = [
    { name: 'Operativo', value: totalOperativo, color: '#10b981' },
    { name: 'En Reparación', value: totalTaller, color: '#f59e0b' },
    { name: 'Agotado/Baja', value: totalAgotado, color: '#ef4444' },
  ];

  // --- 2. PROCESAR FLUJO LOGÍSTICO (Últimos 7 días) ---
  // Creamos un diccionario con los últimos 7 días con valores en 0
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const flujoMap = {};
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = diasSemana[d.getDay()];
    // Usamos la fecha como key para no sobreescribir días iguales de semanas distintas
    const dateKey = d.toISOString().split('T')[0]; 
    flujoMap[dateKey] = { name: dayName, entradas: 0, salidas: 0 };
  }

  // Llenamos con los datos reales
  (movimientosRaw || []).forEach(mov => {
    const dateKey = mov.fecha_movimiento.split('T')[0];
    if (flujoMap[dateKey]) {
      if (mov.tipo_movimiento === 'INGRESO') flujoMap[dateKey].entradas++;
      else flujoMap[dateKey].salidas++; // BAJA, MANTENIMIENTO, SALIDA cuentan como salidas de bodega
    }
  });

  const dataFlujo = Object.values(flujoMap);

  // --- 3. PROCESAR GARANTÍAS POR VENCER ---
  let garantiasPorVencer = 0;
  const hoy = new Date();

  (garantiasRaw || []).forEach(g => {
    if (g.venta && g.venta.fecha_venta) {
      const fechaVenta = new Date(g.venta.fecha_venta);
      const diffTime = hoy - fechaVenta;
      const diasPasados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diasRestantes = g.garantia_dias_cliente - diasPasados;
      
      // Si le quedan entre 1 y 15 días, es una alerta
      if (diasRestantes > 0 && diasRestantes <= 15) {
        garantiasPorVencer++;
      }
    }
  });

  // --- 4. FORMATO FINAL PARA EL FRONTEND ---
  return {
    kpis: {
      stockOperativo: totalOperativo,
      equiposEnTaller: totalTaller,
      stockCriticoCount: stockCriticoRaw?.length || 0,
      garantiasPorVencer: garantiasPorVencer
    },
    dataFlujo,
    dataEstados,
    stockCriticoList: (stockCriticoRaw || []).map(item => ({
      id: item.id,
      nombre: item.nombre,
      stock: item.cantidad_stock,
      min: 2 // Valor fijo por ahora
    }))
  };
};

module.exports = { getDashboardData };