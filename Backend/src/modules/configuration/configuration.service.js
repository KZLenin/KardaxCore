const repository = require('./configuration.repository');

const obtenerGeneral = async () => {
  return await repository.obtenerConfiguracion();
};

const actualizarPerfil = async (datos) => {
  if (datos.nombre_empresa && datos.nombre_empresa.trim() === "") {
    throw new Error("El nombre de la empresa es obligatorio.");
  }

  // Mapeamos solo los campos permitidos para esta pestaña
  const camposPerfil = {
    nombre_empresa: datos.nombre_empresa.trim(),
    ruc_empresa: datos.ruc_empresa ? datos.ruc_empresa.trim() : null,
    direccion: datos.direccion ? datos.direccion.trim() : null,
    telefono: datos.telefono ? datos.telefono.trim() : null
  };

  return await repository.actualizarCampos(camposPerfil);
};

const actualizarInventario = async (datos) => {
  if (datos.stock_critico_global !== undefined && Number(datos.stock_critico_global) < 0) {
    throw new Error("El stock crítico no puede ser negativo.");
  }

  const camposInventario = {
    stock_critico_global: Number(datos.stock_critico_global || 5),
    prefijo_codigo: (datos.prefijo_codigo || 'EQ').toString().toUpperCase().trim()
  };

  return await repository.actualizarCampos(camposInventario);
};

const actualizarLogo = async (file) => {
  if (!file) throw new Error('No se detectó ninguna imagen para el logo.');

  const formatosValidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!formatosValidos.includes(file.mimetype)) {
    throw new Error('Formato no válido. Sube JPG, PNG o WEBP.');
  }

  const extension = file.originalname.split('.').pop();
  const nombreArchivo = `logo_empresa_${Date.now()}.${extension}`; // Generamos nombre único

  // 1. Subimos al storage
  const urlPublica = await repository.subirLogoStorage(file.buffer, nombreArchivo, file.mimetype);

  // 2. Guardamos la URL en la tabla configuracion_empresa
  return await repository.actualizarCampos({ logo_url: urlPublica });
};

module.exports = {
  obtenerGeneral,
  actualizarPerfil,
  actualizarInventario,
  actualizarLogo
};