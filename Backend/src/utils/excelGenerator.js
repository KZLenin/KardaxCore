const ExcelJS = require('exceljs');

/**
 * Motor genérico para generar archivos Excel
 * @param {Array} data - El arreglo de objetos con los datos ya listos.
 * @param {Array} columns - Configuración de columnas { header, key, width }.
 * @param {String} sheetName - Nombre de la pestaña de Excel.
 * @returns {Promise<Buffer>} - El archivo crudo listo para descargar.
 */
const generarExcelGenerico = async (data, columns, sheetName = 'Reporte') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Asignamos las columnas
  worksheet.columns = columns;

  // 2. Estilo corporativo para el encabezado
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // Azul corporativo
  };

  // 3. Insertamos los datos
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // 4. Devolvemos el buffer
  return await workbook.xlsx.writeBuffer();
};

module.exports = {
  generarExcelGenerico
};