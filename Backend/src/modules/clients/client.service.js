const repository = require('./client.repository');

// ==========================================
// MÓDULO 1: EMPRESAS (Entes Financieros)
// ==========================================
const listarEmpresas = async () => {
  return await repository.obtenerClientes(); // Trae las empresas con sus sucursales anidadas
};

const registrarEmpresa = async (datosFront) => {
  // 🔥 Validaciones estrictas para facturación SRI
  if (!datosFront.nombre_empresa) {
    throw new Error('El nombre comercial de la empresa es obligatorio.');
  }
  if (!datosFront.identificacion) {
    throw new Error('La identificación (RUC/Cédula) es obligatoria para facturación.');
  }

  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa.trim().toUpperCase(),
    razon_social: datosFront.razon_social ? datosFront.razon_social.trim().toUpperCase() : null,
    
    // Datos SRI
    tipo_identificacion: datosFront.tipo_identificacion || 'RUC',
    identificacion: datosFront.identificacion.trim(),
    direccion_principal: datosFront.direccion_principal ? datosFront.direccion_principal.trim() : null,
    email_facturacion: datosFront.email_facturacion ? datosFront.email_facturacion.trim().toLowerCase() : null,
    telefono: datosFront.telefono ? datosFront.telefono.trim() : null,
    tipo_contribuyente: datosFront.tipo_contribuyente || 'Régimen General',
    
    // Datos Comerciales
    categoria: datosFront.categoria || 'Cliente Final',
    nombre_contacto: datosFront.nombre_contacto ? datosFront.nombre_contacto.trim() : null,
    limite_credito: datosFront.limite_credito ? Number(datosFront.limite_credito) : 0,
    dias_credito: datosFront.dias_credito ? Number(datosFront.dias_credito) : 0,
    
    estado: 'ACTIVO'
  };

  return await repository.crearEmpresa(empresaData);
};

const actualizarEmpresa = async (id, datosFront) => {
  if (!id) throw new Error("ID de la empresa es requerido");

  // Construimos el objeto dinámicamente para actualizar solo lo que envíe el frontend
  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa?.trim().toUpperCase(),
    razon_social: datosFront.razon_social?.trim().toUpperCase() || null,
    tipo_identificacion: datosFront.tipo_identificacion || null,
    identificacion: datosFront.identificacion?.trim() || null,
    direccion_principal: datosFront.direccion_principal?.trim() || null,
    email_facturacion: datosFront.email_facturacion?.trim().toLowerCase() || null,
    telefono: datosFront.telefono?.trim() || null,
    tipo_contribuyente: datosFront.tipo_contribuyente || null,
    categoria: datosFront.categoria || null,
    nombre_contacto: datosFront.nombre_contacto?.trim() || null,
    limite_credito: datosFront.limite_credito !== undefined ? Number(datosFront.limite_credito) : undefined,
    dias_credito: datosFront.dias_credito !== undefined ? Number(datosFront.dias_credito) : undefined,
  };

  // Limpiamos los campos undefined para que Supabase no se queje
  Object.keys(empresaData).forEach(key => empresaData[key] === undefined && delete empresaData[key]);

  return await repository.actualizarEmpresa(id, empresaData);
};

// ==========================================
// MÓDULO 2: SUCURSALES (Puntos de Entrega)
// ==========================================
const registrarSucursal = async (empresaId, datosFront) => {
  if (!empresaId || !datosFront.contacto_nombre || !datosFront.nombre_sucursal) {
    throw new Error('Faltan datos obligatorios para crear la sucursal.');
  }

  const sucursalData = {
    empresa_id: empresaId,
    nombre_sucursal: datosFront.nombre_sucursal.trim(), // Ej: "SmartFit Condado"
    es_matriz: datosFront.es_matriz || false,
    contacto_nombre: datosFront.contacto_nombre.trim(),
    telefono: datosFront.telefono ? datosFront.telefono.trim() : null,
    email: datosFront.email ? datosFront.email.trim().toLowerCase() : null,
    direccion: datosFront.direccion ? datosFront.direccion.trim() : null
  };

  return await repository.crearSucursal(sucursalData);
};

const actualizarSucursal = async (sucursalId, datosFront) => {
  if (!sucursalId) throw new Error("ID de la sucursal es requerido");

  const sucursalData = {
    nombre_sucursal: datosFront.nombre_sucursal?.trim(),
    es_matriz: datosFront.es_matriz,
    contacto_nombre: datosFront.contacto_nombre?.trim(),
    telefono: datosFront.telefono?.trim() || null,
    email: datosFront.email?.trim().toLowerCase() || null,
    direccion: datosFront.direccion?.trim() || null
  };

  return await repository.actualizarSucursal(sucursalId, sucursalData);
};

const listarSucursales = async (empresaId) => {
  if (!empresaId) throw new Error("El ID de la empresa es requerido para buscar sus sucursales");
  return await repository.obtenerSucursalesPorEmpresa(empresaId);
};

const listarTodasSucursales = async () => {
  return await repository.obtenerTodasSucursales();
};

module.exports = {
  listarEmpresas, listarSucursales, listarTodasSucursales,
  registrarEmpresa, registrarSucursal,
  actualizarEmpresa, actualizarSucursal,
};