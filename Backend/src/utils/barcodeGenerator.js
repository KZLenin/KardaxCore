const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');

const generarPdfEtiquetas = async (codigo, nombreEquipo, cantidad) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Generamos la imagen pura del código de barras (sin texto, solo las rayas)
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128',       // El estándar de la industria
        text: codigo,
        scale: 3,              // Buena resolución para que la térmica no pixele
        height: 12,
        includetext: false,    // Apagamos el texto de la imagen para ponerlo nosotros en HD
      });

      // 2. Configuramos el tamaño físico de la impresora térmica
      // En PDFKit, las medidas son en "Puntos". 1 mm = 2.83 puntos aprox.
      // Etiqueta estándar térmica: 58mm x 40mm = 164pt x 113pt
      const doc = new PDFDocument({
        size: [144, 72],
        margins: { top: 2, bottom: 2, left: 5, right: 5 }
      });

      // 3. Preparamos el recolector del archivo PDF en la memoria RAM
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers))); // Cuando termine, nos devuelve el archivo listo

      // 4. El bucle multiplicador (La Magia)
      for (let i = 0; i < cantidad; i++) {
        if (i > 0) doc.addPage(); // Añadimos página a partir del segundo ticket

        // --- ENCABEZADO GYMTECH ---
        doc.fontSize(8)
           .font('Times-Bold')
           .text("GymTech", 5, 5, { align: 'left', width: 144 });

        // --- NOMBRE DEL EQUIPO (Justo debajo de GymTech) ---
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .text(nombreEquipo.substring(0, 35), 0, 16, { align: 'center', width: 144 });

        // --- IMAGEN DEL CÓDIGO DE BARRAS ---
        doc.image(barcodeBuffer, 5, 25, { fit: [134, 35], align: 'center' });

        // --- CÓDIGO EN LETRAS (Pegado a las barras) ---
        doc.fontSize(8)
           .font('Courier-Bold') // Fuente monoespaciada tipo consola
           .text(codigo, 0, 58, { align: 'center', width: 144 });
      }

      // 5. Cerramos el documento
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

const generarPdfEtiquetasMasivo = async (equipos) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Configuramos el tamaño de la etiqueta (50x25mm aprox / 144x72pt)
      const doc = new PDFDocument({
        size: [144, 72],
        margins: { top: 2, bottom: 2, left: 5, right: 5 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 2. Iteramos sobre el array de equipos seleccionados
      for (let i = 0; i < equipos.length; i++) {
        const { codigo, nombreEquipo } = equipos[i];

        // Generamos el buffer de imagen para el código actual
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: codigo,
          scale: 3,
          height: 12,
          includetext: false,
        });

        // Si no es la primera etiqueta, saltamos a una nueva página física
        if (i > 0) doc.addPage();

        // --- ENCABEZADO GYMTECH (Misma posición que tu original) ---
        doc.fontSize(8)
           .font('Times-Bold')
           .text("GymTech", 5, 5, { align: 'left', width: 144 });

        // --- NOMBRE DEL EQUIPO ---
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .text(nombreEquipo.substring(0, 35).toUpperCase(), 0, 16, { align: 'center', width: 144 });

        // --- IMAGEN DEL CÓDIGO DE BARRAS ---
        doc.image(barcodeBuffer, 5, 25, { fit: [134, 35], align: 'center' });

        // --- CÓDIGO EN LETRAS ---
        doc.fontSize(8)
           .font('Courier-Bold')
           .text(codigo, 0, 58, { align: 'center', width: 144 });
      }

      // 3. Finalizamos el documento
      doc.end();

    } catch (error) {
      console.error("Error generando lote de etiquetas:", error);
      reject(error);
    }
  });
};

module.exports = { generarPdfEtiquetas, generarPdfEtiquetasMasivo };