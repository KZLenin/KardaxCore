const quotesService = require('./quotes.service');
const PDFDocument = require('pdfkit');

const generarCotizacion = async (req, res) => {
  try {
    const datosOrden = req.body;
    const resultado = await quotesService.generarCotizacionDesdeOrden(datosOrden);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('[Error en Controlador de Cotizaciones]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const getCotizaciones = async (req, res) => {
  try {
    const filtros = { estado: req.query.estado };
    const cotizaciones = await quotesService.listarCotizaciones(filtros);
    res.status(200).json(cotizaciones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await quotesService.obtenerDetalleCotizacion(id);
    res.status(200).json(cotizacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    const resultado = await quotesService.actualizarCotizacion(id, datosActualizados);
    res.status(200).json({ mensaje: 'Cotización actualizada', data: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const procesarAprobacionCotizacion = async (req, res) => {
  try {
    const { id } = req.params; 
    const { detalles_aceptados } = req.body; 
    const usuarioId = req.usuario.id; 

    if (!Array.isArray(detalles_aceptados)) {
      return res.status(400).json({ error: 'Debes enviar un arreglo con los IDs de los detalles aceptados.' });
    }

    const resultado = await quotesService.procesarAprobacion(id, detalles_aceptados, usuarioId);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('[Error al procesar Aprobación]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const descargarProformaPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Traemos la data calculada desde el servicio
    const cotizacion = await quotesService.obtenerDetalleCotizacion(id);

    // 2. Creamos el documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // 3. Configuramos la respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Proforma_${cotizacion.id.split('-')[0]}.pdf"`);
    doc.pipe(res);

    // ==========================================
    // 🎨 DIBUJANDO EL PDF (Estilo GYMTECH)
    // ==========================================
    
    // Cabecera Corporativa
    doc.fontSize(20).font('Helvetica-Bold').text('GYMTECH', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('PROFORMA DE SERVICIOS / REPUESTOS', { align: 'center' });
    doc.fontSize(10).fillColor('gray').text(`Estado: ${cotizacion.estado}`, { align: 'center' });
    doc.moveDown(2);

    // Datos del Cliente
    doc.fontSize(12).font('Helvetica-Bold').fillColor('black').text('Datos Comerciales:');
    doc.font('Helvetica').fontSize(10);
    
    const cliente = cotizacion.clientes_empresas;
    doc.text(`Cliente / Empresa: ${cliente.nombre_comercial}`);
    if (cliente.identificacion) doc.text(`RUC / ID: ${cliente.identificacion}`);
    if (cliente.email_facturacion) doc.text(`Email: ${cliente.email_facturacion}`);
    if (cliente.telefono) doc.text(`Teléfono: ${cliente.telefono}`);
    
    doc.text(`Fecha Emisión: ${new Date(cotizacion.fecha_emision).toLocaleDateString()}`);
    doc.text(`N° Orden Referencia: ${cotizacion.numero_orden_externa || 'S/N'}`);
    doc.moveDown(2);

    // Tabla de Equipos (Cabeceras)
    doc.font('Helvetica-Bold');
    doc.text('Descripción del Repuesto', 50, doc.y);
    doc.text('Cant.', 350, doc.y);
    doc.text('P. Unit', 420, doc.y);
    doc.text('Subtotal', 480, doc.y);
    
    doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
    doc.moveDown(1.5);

    // Tabla de Equipos (Filas)
    doc.font('Helvetica');
    if (cotizacion.cotizaciones_detalle) {
      cotizacion.cotizaciones_detalle.forEach(det => {
        let yActual = doc.y;
        
        const nombreItem = det.inventario ? det.inventario.nombre : 'Repuesto desconocido';
        const codigoItem = det.inventario ? det.inventario.codigo_barras : 'S/C';

        // Nombre del Equipo
        doc.fontSize(10).fillColor('black').text(nombreItem, 50, yActual, { width: 280 });
        
        // Código del Equipo 
        doc.fontSize(8).fillColor('blue').text(`Cód: ${codigoItem || 'S/N'}`, 50, doc.y);
        
        // Valores numéricos
        doc.fontSize(10).fillColor('black');
        doc.text(det.cantidad.toString(), 350, yActual);
        doc.text(`$${Number(det.precio_unitario).toFixed(2)}`, 420, yActual);
        doc.text(`$${Number(det.subtotal).toFixed(2)}`, 480, yActual);
        
        doc.moveDown(1);
      });
    }

    // Línea final de tabla
    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();
    doc.moveDown(1.5);

    // Total Estimado
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`TOTAL ESTIMADO: $${Number(cotizacion.total_estimado).toFixed(2)}`, { align: 'right' });
    
    // Nota aclaratoria
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('gray');
    doc.text('Nota: Esta proforma no constituye una factura válida para efectos tributarios. Los precios y disponibilidad están sujetos a cambios sin previo aviso.', { align: 'justify' });
    if (cotizacion.notas_adicionales) {
      doc.moveDown(0.5);
      doc.text(`Observaciones: ${cotizacion.notas_adicionales}`);
    }

    // Pie de página
    doc.moveDown(4);
    doc.fontSize(10).font('Helvetica').fillColor('black');
    doc.text('________________________________', { align: 'center' });
    doc.text('Aprobación del Cliente', { align: 'center' });

    // 5. Cerramos
    doc.end();

  } catch (error) {
    console.error("Error PDF Cotización:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar la proforma PDF' });
    }
  }
};

module.exports = {
  generarCotizacion,
  getCotizaciones,
  getCotizacionPorId,
  actualizarCotizacion,
  procesarAprobacionCotizacion,
  descargarProformaPDF
};