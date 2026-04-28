const supabase = require('../../config/supabase');

const obtenerEstadisticas = async () => {
  const fechaHace7Dias = new Date();
  fechaHace7Dias.setDate(fechaHace7Dias.getDate() - 6);
  const fecha7DiasISO = fechaHace7Dias.toISOString();

  const [
    { data: inventarioRaw },
    { data: movimientosRaw },
    { data: stockCriticoRaw }, // ← Vamos a filtrar esto mejor en el Service
    { data: garantiasRaw }
  ] = await Promise.all([
    supabase.from('inventario').select('estado_operativo, cantidad_stock'),
    
    supabase.from('movimientos_logisticos')
            .select('tipo_movimiento, fecha_movimiento')
            .gte('fecha_movimiento', fecha7DiasISO),
            
    // 🔥 CAMBIO AQUÍ: Traemos serie y es_externo para poder discriminar
    supabase.from('inventario')
            .select('id, nombre, cantidad_stock, serie_fabricante, es_externo')
            .lte('cantidad_stock', 2)
            .neq('estado_operativo', 'Agotado/Baja'),
            
    supabase.from('ventas_detalle')
            .select(`
              garantia_dias_cliente,
              venta:ventas ( fecha_venta )
            `)
            .gt('garantia_dias_cliente', 0)
  ]);

  return { inventarioRaw, movimientosRaw, stockCriticoRaw, garantiasRaw };
};

module.exports = { obtenerEstadisticas };