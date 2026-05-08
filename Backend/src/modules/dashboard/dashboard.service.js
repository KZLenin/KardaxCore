const repository = require('./dashboard.repository');

const getDashboardData = async () => {
  const { inventarioRaw, movimientosRaw, garantiasRaw } = await repository.obtenerEstadisticas();

  let totalOperativo = 0;
  let totalTaller = 0;
  let totalAgotado = 0;

  const stockAgrupado = {};

  (inventarioRaw || []).forEach(item => {
    // 1. Salud Global (Para el gráfico de pastel)
    if (item.estado_operativo === 'Operativo') totalOperativo++;
    else if (item.estado_operativo === 'En Reparación') totalTaller++;
    else if (item.estado_operativo === 'Agotado/Baja' || item.estado_operativo === 'Vendido') totalAgotado++;

    // 2. ALERTA DE STOCK INTELIGENTE 🔥
    // Si tiene serie o es unidad única, NO lo monitoreamos en restock.
    const tieneSerie = item.serie_fabricante && item.serie_fabricante.trim() !== '';
    const esUnico = item.unidad_medida === 'UNIDAD' || tieneSerie;
    const esPropio = !item.es_externo;

    // Filtramos: Solo propios, que NO sean únicos (es decir, repuestos) 
    // y de paso, ignoramos cualquier basura que tenga la palabra "PRUEBA" en el nombre.
    if (esPropio && !esUnico && !item.nombre.toUpperCase().includes('PRUEBA')) {
      const nombreLlave = item.nombre.trim().toUpperCase();
      
      if (!stockAgrupado[nombreLlave]) {
        stockAgrupado[nombreLlave] = {
          id: item.id,
          nombre: item.nombre,
          stock_total: 0
        };
      }
      stockAgrupado[nombreLlave].stock_total += (item.cantidad_stock || 0);
    }
  });

  // Filtramos y ordenamos: Solo los repuestos que sumados den <= 2
  const listaCriticaReal = Object.values(stockAgrupado)
    .filter(grupo => grupo.stock_total <= 2)
    .sort((a, b) => a.stock_total - b.stock_total);

  // --- 3. PROCESAR FLUJO LOGÍSTICO ---
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

  // --- 4. GARANTÍAS ---
  let garantiasPorVencer = 0;
  const hoy = new Date();
  (garantiasRaw || []).forEach(g => {
    if (g.venta?.fecha_venta) {
      const diasPasados = Math.floor((hoy - new Date(g.venta.fecha_venta)) / (1000 * 60 * 60 * 24));
      const diasRestantes = g.garantia_dias_cliente - diasPasados;
      if (diasRestantes > 0 && diasRestantes <= 15) garantiasPorVencer++;
    }
  });

  const dataEstados = [
    { name: 'Operativo', value: totalOperativo, color: '#10b981' },
    { name: 'En Reparación', value: totalTaller, color: '#f59e0b' },
    { name: 'Agotado/Baja', value: totalAgotado, color: '#ef4444' },
  ];

  // --- 5. ENVIAMOS LA DATA AL FRONTEND ---
  return {
    kpis: {
      stockOperativo: totalOperativo,
      equiposEnTaller: totalTaller,
      stockCriticoCount: listaCriticaReal.length, // Número real de insumos por agotarse
      garantiasPorVencer: garantiasPorVencer
    },
    dataFlujo: Object.values(flujoMap),
    dataEstados,
    stockCriticoList: listaCriticaReal.slice(0, 5).map(item => ({
      id: item.id,
      nombre: item.nombre,
      stock: item.stock_total, 
      min: 2
    }))
  };
};

module.exports = { getDashboardData };