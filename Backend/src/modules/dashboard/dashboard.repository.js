const supabase = require('../../config/supabase');

const obtenerEstadisticas = async () => {
  const fechaHace7Dias = new Date();
  fechaHace7Dias.setDate(fechaHace7Dias.getDate() - 6);
  const fecha7DiasISO = fechaHace7Dias.toISOString();

  const [
    { data: inventarioRaw },
    { data: movimientosRaw },
    { data: garantiasRaw }
  ] = await Promise.all([
    // 🔥 REGRESAMOS serie_fabricante y unidad_medida PARA PODER FILTRAR LA BASURA
    supabase.from('inventario').select('id, nombre, cantidad_stock, estado_operativo, es_externo, serie_fabricante, unidad_medida'),
    
    supabase.from('movimientos_logisticos')
            .select('tipo_movimiento, fecha_movimiento')
            .gte('fecha_movimiento', fecha7DiasISO),
            
    supabase.from('ventas_detalle')
            .select('garantia_dias_cliente, venta:ventas ( fecha_venta )')
            .gt('garantia_dias_cliente', 0)
  ]);

  return { inventarioRaw, movimientosRaw, garantiasRaw };
};

module.exports = { obtenerEstadisticas };