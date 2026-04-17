const supabase = require('../../config/supabase');

// 1. Consultar el artículo actual (para ver si hay stock)
const obtenerItem = async (itemId) => {
  const { data, error } = await supabase.from('inventario').select('*').eq('id', itemId).single();
  if (error) throw new Error(`Error al obtener ítem: ${error.message}`);
  return data;
};

// 2. Actualizar la cantidad en bodega
const actualizarStock = async (itemId, nuevoStock) => {
  const { error } = await supabase.from('inventario').update({ cantidad_stock: nuevoStock }).eq('id', itemId);
  if (error) throw new Error(`Error al actualizar stock: ${error.message}`);
};

// 3. Registrar el ticket logístico
const insertarMovimiento = async (movimiento) => {
  const { data, error } = await supabase.from('movimientos_logisticos').insert([movimiento]).select().single();
  if (error) throw new Error(`Error al guardar movimiento: ${error.message}`);
  return data;
};

// 4. Registrar la cadena de custodia
const insertarHistorial = async (historial) => {
  const { error } = await supabase.from('historial_seguimiento').insert([historial]);
  if (error) throw new Error(`Error al guardar historial: ${error.message}`);
};

//Busca un ítem específicamente por su identificador físico (Barras o Serie)
const buscarItemPorCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('*, categorias(nombre)')
    .or(`codigo_barras.eq.${codigo},serie_fabricante.eq.${codigo}`)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignorar error de "no encontrado" para manejarlo en el service
    throw new Error(`Error al buscar código: ${error.message}`);
  }
  return data;
};

const obtenerHistorial = async () => {
  const { data, error } = await supabase
    .from('historial_seguimiento')
    .select(`
      *,
      inventario ( nombre )
    `)
    .order('fecha_registro', { ascending: false }); // Los más nuevos primero

  if (error) throw new Error(`Error al cargar la bitácora: ${error.message}`);
  return data;
};

const obtenerHistorialDeItem = async (itemId) => {
  const { data, error } = await supabase
    .from('historial_seguimiento')
    .select('*')
    .eq('item_id', itemId)
    .order('fecha_registro', { ascending: false });
    
  if (error) throw new Error(`Error al buscar historia del equipo: ${error.message}`);
  return data;
};

// 🔥 NUEVO: Buscar si este equipo fue vendido (Para la tarjeta de Garantía)
const obtenerVentaDeItem = async (itemId) => {
  const { data, error } = await supabase
    .from('ventas_detalle')
    .select(`
      garantia_dias_cliente,
      venta:ventas (
        fecha_venta,
        numero_comprobante,
        empresa:clientes_empresas(nombre_comercial)
      )
    `)
    .eq('item_id', itemId)
    .order('id', { ascending: false }) // Traemos la venta más reciente
    .limit(1)
    .single();

  // Ignoramos el error PGRST116 (Significa que no hay ventas, lo cual es normal si está en bodega)
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const actualizarEstadoOperativo = async (itemId, nuevoEstado) => {
  const { error } = await supabase
    .from('inventario')
    .update({ estado_operativo: nuevoEstado })
    .eq('id', itemId);
    
  if (error) throw new Error(`Error al cambiar estado operativo: ${error.message}`);
};

// 🔥 NUEVO: Crear el ticket para los técnicos
const crearOrdenTrabajo = async (ordenData) => {
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .insert([ordenData])
    .select()
    .single();
    
  if (error) throw new Error(`Error al generar Orden de Trabajo: ${error.message}`);
  return data;
};

const actualizarEstadoEquipo = async (itemId, nuevoEstado) => {
  const { error } = await supabase
    .from('inventario')
    .update({ estado_operativo: nuevoEstado })
    .eq('id', itemId);
    
  if (error) throw new Error(`Error al liberar equipo del taller: ${error.message}`);
};

// 2. Deja el rastro en la bitácora de que el técnico lo arregló
const registrarHistorialLiberacion = async (itemId, tipoAccion, descripcion) => {
  const { error } = await supabase
    .from('historial_seguimiento')
    .insert([{
      item_id: itemId,
      tipo_accion: tipoAccion,
      descripcion: descripcion,
      // Si tienes el ID del técnico a la mano, puedes pasarlo, sino 'Sistema' funciona perfecto
      usuario_responsable: null, 
      fecha_registro: new Date().toISOString()
    }]);
    
  if (error) throw new Error(`Error al guardar bitácora de taller: ${error.message}`);
};

const actualizarKardex = async (itemId, nuevoStock, nuevoEstado) => {
  const { error } = await supabase
    .from('inventario')
    .update({ 
      cantidad_stock: nuevoStock,
      estado_operativo: nuevoEstado 
    })
    .eq('id', itemId);

  if (error) throw new Error(`Error actualizando inventario: ${error.message}`);
};

module.exports = { 
  obtenerItem, buscarItemPorCodigo, obtenerHistorial, obtenerHistorialDeItem, obtenerVentaDeItem,
  actualizarStock, actualizarEstadoOperativo, actualizarEstadoEquipo, actualizarKardex,
  insertarMovimiento, insertarHistorial, crearOrdenTrabajo, registrarHistorialLiberacion,
};