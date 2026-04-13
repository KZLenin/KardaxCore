const repository = require('./client.repository');

const listarClientes = async () => {
  return await repository.obtenerClientes();
};

const registrarCliente = async (datosFront) => {
  // 1. Validaciones básicas
  if (!datosFront.nombre_empresa || !datosFront.contacto_nombre) {
    throw new Error('El nombre de la empresa y el contacto son obligatorios.');
  }

  // 2. Preparamos y guardamos el Ente Financiero (Empresa)
  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa.trim().toUpperCase(),
    // Como en el front unificamos RUC y Razón social en un solo campo, lo guardamos aquí
    razon_social: datosFront.ruc_razon_social ? datosFront.ruc_razon_social.trim() : null,
    estado: 'ACTIVO'
  };

  const nuevaEmpresa = await repository.crearEmpresa(empresaData);

  // 3. Preparamos y guardamos el Punto de Entrega (Sucursal Matriz) usando el ID que nos dio el paso anterior
  const sucursalData = {
    empresa_id: nuevaEmpresa.id,
    nombre_sucursal: 'Sede Matriz', // Por defecto la primera es la Matriz
    es_matriz: true,
    contacto_nombre: datosFront.contacto_nombre.trim(),
    telefono: datosFront.telefono ? datosFront.telefono.trim() : null,
    email: datosFront.email ? datosFront.email.trim().toLowerCase() : null,
    direccion: datosFront.direccion ? datosFront.direccion.trim() : null
  };

  const nuevaSucursal = await repository.crearSucursal(sucursalData);

  // 4. Devolvemos el objeto completo armado para que el Front lo lea feliz
  return {
    ...nuevaEmpresa,
    sucursales: [nuevaSucursal]
  };
};

const actualizarCliente = async (empresaId, datosFront) => {
  if (!empresaId) throw new Error("ID de la empresa es requerido");

  // 1. Actualizamos la Empresa
  const empresaData = {
    nombre_comercial: datosFront.nombre_empresa?.trim().toUpperCase(),
    razon_social: datosFront.ruc_razon_social?.trim() || null,
  };
  await repository.actualizarEmpresa(empresaId, empresaData);

  // 2. Actualizamos la Sucursal Principal (Matriz)
  // Nota: Asumimos que mandas el sucursal_id desde el frontend
  if (datosFront.sucursal_id) {
    const sucursalData = {
      contacto_nombre: datosFront.contacto_nombre?.trim(),
      telefono: datosFront.telefono?.trim() || null,
      email: datosFront.email?.trim().toLowerCase() || null,
      direccion: datosFront.direccion?.trim() || null
    };
    await repository.actualizarSucursal(datosFront.sucursal_id, sucursalData);
  }

  return { mensaje: "Cliente actualizado correctamente" };
};

module.exports = {
  listarClientes,
  registrarCliente,
  actualizarCliente
};