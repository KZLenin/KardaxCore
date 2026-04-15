const supabase = require('../../config/supabase');

const obtenerEstadisticas = async () => {
  // Obtenemos la fecha de hace 7 días para el flujo logístico
  const fechaHace7Dias = new Date();
  fechaHace7Dias.setDate(fechaHace7Dias.getDate() - 6);
  const fecha7DiasISO = fechaHace7Dias.toISOString();

  // Ejecutamos múltiples consultas a Supabase en paralelo para no hacer esperar al cliente
  const [
    { data: inventarioRaw },
    { data: movimientosRaw },
    { data: stockCriticoRaw },
    { data: garantiasRaw }
  ] = await Promise.all([
    // 1. Todo el inventario para contar estados
    supabase.from('inventario').select('estado_operativo, cantidad_stock'),
    
    // 2. Movimientos de los últimos 7 días
    supabase.from('movimientos_logisticos')
            .select('tipo_movimiento, fecha_movimiento')
            .gte('fecha_movimiento', fecha7DiasISO),
            
    // 3. Top 5 Stock Crítico (<= 2 unidades)
    supabase.from('inventario')
            .select('id, nombre, cantidad_stock')
            .lte('cantidad_stock', 2)
            .neq('estado_operativo', 'Agotado/Baja')
            .limit(5),
            
    // 4. Ventas con garantía para calcular vencimientos (Traemos las recientes)
    // En un sistema muy masivo esto se haría con un Trigger/Vista, pero para empezar está perfecto
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