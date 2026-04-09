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
        height: 10,
        includetext: false,    // Apagamos el texto de la imagen para ponerlo nosotros en HD
      });

      // 2. Configuramos el tamaño físico de la impresora térmica
      // En PDFKit, las medidas son en "Puntos". 1 mm = 2.83 puntos aprox.
      // Etiqueta estándar térmica: 58mm x 40mm = 164pt x 113pt
      const doc = new PDFDocument({
        size: [164, 113],
        margins: { top: 5, bottom: 5, left: 5, right: 5 }
      });

      // 3. Preparamos el recolector del archivo PDF en la memoria RAM
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers))); // Cuando termine, nos devuelve el archivo listo

      // 4. El bucle multiplicador (La Magia)
      for (let i = 0; i < cantidad; i++) {
        if (i > 0) doc.addPage(); // Añadimos página a partir del segundo ticket

        // Nombre del equipo arriba (Letra chiquita)
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text(nombreEquipo.substring(0, 30), 0, 10, { align: 'center', width: 164 });

        // La imagen del código de barras al centro
        doc.image(barcodeBuffer, 12, 25, { fit: [140, 50], align: 'center' });

        // El código de barras en texto abajo (Letra más grande para el usuario)
        doc.fontSize(10)
           .font('Courier-Bold') // Fuente monoespaciada tipo consola
           .text(codigo, 0, 85, { align: 'center', width: 164 });
      }

      // 5. Cerramos el documento
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generarPdfEtiquetas };