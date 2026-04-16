const salesService = require('./sales.service');
const repository = require('./sales.repository');
const PDFDocument = require('pdfkit');

const registrarVenta = async (req, res) => {
  try {
    const vendedorId = req.usuario?.id || 'Sistema'; // Viene de tu middleware auth
    
    const resultado = await salesService.procesarVentaB2B(req.body, vendedorId);
    
    res.status(201).json({ 
      mensaje: 'Venta completada y stock actualizado exitosamente.', 
      data: resultado 
    });
  } catch (error) {
    console.error('🚨 ERROR EN VENTA:', error);
    res.status(400).json({ error: error.message });
  }
};

const getHistorialVentas = async (req, res) => {
  try {
    // Mandamos los query params (ej. ?buscar=SmartFit) al servicio
    const data = await salesService.obtenerHistorial(req.query);
    
    // Respondemos con éxito
    res.status(200).json(data);
  } catch (error) {
    console.error("🚨 Error en getHistorialVentas:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
const getDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si tienes un sales.service.js, llámalo desde ahí. 
    // Si llamas directo al repositorio, hazlo así:
    const detalle = await repository.obtenerDetalleVenta(id); 
    
    res.status(200).json(detalle);
  } catch (error) {
    console.error("🚨 ERROR AL TRAER DETALLE:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const descargarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Traemos los mismos datos que usa el "Ojito" (asegúrate que el repository traiga codigo_barras)
    const detalle = await repository.obtenerDetalleVenta(id);

    // 2. Creamos el documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // 3. Configuramos la respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Comprobante_${detalle.numero_comprobante || 'SN'}.pdf"`);

    // 4. Conectamos el PDF directamente a la respuesta
    doc.pipe(res);

    // ==========================================
    // 🎨 DIBUJANDO EL PDF
    // ==========================================
    
    // Cabecera Corporativa
    doc.fontSize(20).font('Helvetica-Bold').text('GYMTECH', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Comprobante de Entrega de Equipos', { align: 'center' });
    doc.moveDown(2);

    // Datos del Cliente y Factura
    doc.fontSize(12).font('Helvetica-Bold').text('Datos Comerciales:');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Cliente / Empresa: ${detalle.empresa_nombre}`);
    if (detalle.ruc) doc.text(`RUC: ${detalle.ruc}`);
    doc.text(`Sede de Entrega: ${detalle.sucursal_nombre || 'Principal'}`);
    
    if (detalle.direccion_envio) {
        doc.text(`Dirección: ${detalle.direccion_envio}`);
    }
    
    if (detalle.contacto_entrega && detalle.contacto_entrega !== 'S/N') {
        doc.text(`Atención: ${detalle.contacto_entrega}`);
    }
    
    doc.text(`Fecha: ${new Date(detalle.fecha_venta).toLocaleDateString()}`);
    doc.text(`Comprobante / Recibo: ${detalle.numero_comprobante || 'S/N'}`);
    doc.text(`PO del Cliente: ${detalle.po_cliente || 'N/A'}`);
    doc.moveDown(2);

    // Tabla de Equipos (Cabeceras)
    doc.font('Helvetica-Bold');
    doc.text('Descripción del Equipo', 50, doc.y);
    doc.text('Cant.', 350, doc.y);
    doc.text('P. Unit', 420, doc.y);
    doc.text('Subtotal', 480, doc.y);
    
    doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
    doc.moveDown(1.5);

    // Tabla de Equipos (Filas)
    doc.font('Helvetica');
    detalle.items.forEach(item => {
      let yActual = doc.y;
      
      // Nombre del Equipo
      doc.fontSize(10).fillColor('black').text(item.item_nombre, 50, yActual, { width: 280 });
      
      // 🚀 NUEVO: Código del Equipo (justo debajo del nombre)
      doc.fontSize(8).fillColor('blue').text(`Cód: ${item.codigo || 'S/N'}`, 50, doc.y);
      
      // Restauramos posición para las otras columnas
      doc.fontSize(10).fillColor('black');
      doc.text(item.cantidad.toString(), 350, yActual);
      doc.text(`$${Number(item.precio_unitario).toFixed(2)}`, 420, yActual);
      doc.text(`$${((item.cantidad * item.precio_unitario)).toFixed(2)}`, 480, yActual);
      
      doc.moveDown(0.5);
      
      // Si tiene garantía
      if (item.garantia_dias > 0) {
        doc.fontSize(8).fillColor('gray').text(`Garantía: ${item.garantia_dias} días`, 50, doc.y+4);
        doc.fontSize(10).fillColor('black');
        doc.moveDown(0.5);
      }
      
      // Espacio extra entre ítems
      doc.moveDown(0.5);
    });

    // Línea final de tabla
    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();
    doc.moveDown(1.5);

    // Total a Cobrar
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`TOTAL: $${Number(detalle.total_venta).toFixed(2)}`, { align: 'right' });

    // Pie de página
    doc.moveDown(4);
    doc.fontSize(10).font('Helvetica');
    doc.text('________________________________', { align: 'center' });
    doc.text('Firma de Recibido Conforme', { align: 'center' });

    // 5. Cerramos
    doc.end();

  } catch (error) {
    console.error("Error PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar el documento PDF' });
    }
  }
};
module.exports = { registrarVenta, getHistorialVentas, getDetalleVenta, descargarPDF };