const repository = require('./dashboard.repository');

const getDashboardData = async () => {
  const { inventarioRaw, movimientosRaw, stockCriticoRaw, garantiasRaw } = await repository.obtenerEstadisticas();

  // --- 1. PROCESAR SALUD DEL INVENTARIO ---
  let totalOperativo = 0;
  let totalTaller = 0;
  let totalAgotado = 0;

  (inventarioRaw || []).forEach(item => {
    if (item.estado_operativo === 'Operativo') totalOperativo++;
    else if (item.estado_operativo === 'En Reparación') totalTaller++;
    else if (item.estado_operativo === 'Agotado/Baja') totalAgotado++;
  });

  const dataEstados = [
    { name: 'Operativo', value: totalOperativo, color: '#10b981' },
    { name: 'En Reparación', value: totalTaller, color: '#f59e0b' },
    { name: 'Agotado/Baja', value: totalAgotado, color: '#ef4444' },
  ];

  // --- 2. FILTRADO INTELIGENTE DE STOCK CRÍTICO 🔥 ---
  // Solo contamos como crítico si:
  // - NO tiene número de serie (es un consumible/repuesto)
  // - NO es un equipo externo de cliente
  const listaCriticaReal = (stockCriticoRaw || []).filter(item => {
    const esRepuesto = !item.serie_fabricante; // Si no tiene serie, es repuesto
    const esPropio = !item.es_externo;         // No nos importa el stock de lo que no es nuestro
    return esRepuesto && esPropio;
  });

  // --- 3. PROCESAR FLUJO LOGÍSTICO (Sin cambios, ya funciona bien) ---
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const flujoMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0]; 
    flujoMap[dateKey] = { name: diasSemana[d.getDay()], entradas: 0, salidas: 0 };
  }

  (movimientosRaw || []).forEach(mov => {
    const dateKey = mov.fecha_movimiento.split('T')[0];
    if (flujoMap[dateKey]) {
      if (mov.tipo_movimiento === 'INGRESO') flujoMap[dateKey].entradas++;
      else flujoMap[dateKey].salidas++;
    }
  });

  // --- 4. GARANTÍAS (Sin cambios) ---
  let garantiasPorVencer = 0;
  const hoy = new Date();
  (garantiasRaw || []).forEach(g => {
    if (g.venta?.fecha_venta) {
      const diasPasados = Math.floor((hoy - new Date(g.venta.fecha_venta)) / (1000 * 60 * 60 * 24));
      const diasRestantes = g.garantia_dias_cliente - diasPasados;
      if (diasRestantes > 0 && diasRestantes <= 15) garantiasPorVencer++;
    }
  });

  // --- 5. FORMATO FINAL ---
  return {
    kpis: {
      stockOperativo: totalOperativo,
      equiposEnTaller: totalTaller,
      stockCriticoCount: listaCriticaReal.length, // 🔥 Ahora devuelve el número real de repuestos faltantes
      garantiasPorVencer: garantiasPorVencer
    },
    dataFlujo: Object.values(flujoMap),
    dataEstados,
    stockCriticoList: listaCriticaReal.slice(0, 5).map(item => ({ // Top 5 reales
      id: item.id,
      nombre: item.nombre,
      stock: item.cantidad_stock,
      min: 2
    }))
  };
};

module.exports = { getDashboardData };