
const generarDataEtiqueta = (item, movimiento) => {
  // Aquí estructuramos exactamente lo que va a salir impreso en el papel
  const etiqueta = {
    titulo: 'SOI SOLUCIONES - LOGÍSTICA',
    codigo_barras: item.codigo_barras, // Vital para el escáner
    articulo: item.nombre,
    // Si origen_id es null, asumimos que sale de la bodega principal
    origen: movimiento.origen_id ? `Sede ID: ${movimiento.origen_id}` : 'BODEGA CENTRAL', 
    destino: movimiento.destino_nombre,
    direccion: movimiento.destino_direccion || 'No especificada',
    precio: movimiento.precio_venta ? `$${movimiento.precio_venta}` : 'N/A',
    fecha: new Date(movimiento.fecha_movimiento).toLocaleDateString(),
    // Generamos un código corto de rastreo basado en el UUID del movimiento
    tracking_id: movimiento.id.split('-')[0].toUpperCase() 
  };

  // Simulamos el envío a la cola de impresión en la consola del servidor
  console.log('\n🖨️ [CROME PRINTER] PREPARANDO ETIQUETA...');
  console.table(etiqueta);
  console.log('🖨️ [CROME PRINTER] LISTO PARA IMPRIMIR.\n');

  return etiqueta;
};

module.exports = { generarDataEtiqueta };