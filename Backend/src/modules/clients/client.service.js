const repository = require('./client.repository');

// ==========================================
// MÓDULO 1: EMPRESAS (Entes Financieros)
// ==========================================
const listarEmpresas = async () => {
  return await repository.obtenerClientes(); // Trae las empresas con sus sucursales anidadas
};

const registrarEmpresa = async (datosFront) => {
  if (!datosFront.nombre_empresa) {
    throw new Error('El nombre de la empresa es obligatorio.');
  }

  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa.trim().toUpperCase(),
    razon_social: datosFront.ruc_razon_social ? datosFront.ruc_razon_social.trim() : null,
    ruc: datosFront.ruc ? datosFront.ruc.trim() : null,
    estado: 'ACTIVO'
  };

  return await repository.crearEmpresa(empresaData);
};

const actualizarEmpresa = async (id, datosFront) => {
  if (!id) throw new Error("ID de la empresa es requerido");

  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa?.trim().toUpperCase(),
    razon_social: datosFront.ruc_razon_social?.trim() || null,
    ruc: datosFront.ruc?.trim() || null,
  };

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

module.exports = {
  listarEmpresas, listarSucursales,
  registrarEmpresa, registrarSucursal,
  actualizarEmpresa, actualizarSucursal,
};