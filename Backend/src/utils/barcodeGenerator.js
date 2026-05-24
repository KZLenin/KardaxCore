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
      if (!equipos || equipos.length === 0) {
        console.error("❌ [BACKEND] Error: El array de equipos llegó vacío.");
        return reject(new Error("No hay equipos para generar etiquetas"));
      }

      const doc = new PDFDocument({
        size: [144, 72],
        margins: { top: 2, bottom: 2, left: 5, right: 5 },
        compress: true 
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfFinal = Buffer.concat(buffers);
        resolve(pdfFinal);
      });

      const TAMANO_LOTE = 25; 
      let esPrimeraPagina = true;
      let contadorEtiquetasExitosas = 0;

      for (let i = 0; i < equipos.length; i += TAMANO_LOTE) {
        const loteActual = equipos.slice(i, i + TAMANO_LOTE);
        // Generar barras del lote actual
        const promesasLote = loteActual.map(async (eq, indexInterno) => {
          try {
            if (!eq.codigo) {
              console.warn(`⚠️ [BACKEND] Ítem [${i + indexInterno}] ("${eq.nombreEquipo}") no tiene código. Saltando código de barras.`);
              return { ...eq, barcodeBuffer: null };
            }

            const buffer = await bwipjs.toBuffer({
              bcid: 'code128',
              text: eq.codigo.toString(),
              scale: 2,
              height: 12,
              includetext: false,
            });
            return { ...eq, barcodeBuffer: buffer };
          } catch (err) {
            console.error(`🚨 [BACKEND] Error en bwipjs para código [${eq.codigo}] del equipo [${eq.nombreEquipo}]:`, err.message);
            return { ...eq, barcodeBuffer: null };
          }
        });

        const equiposProcesadosLote = await Promise.all(promesasLote);


        // Pintar lote actual
        for (const eq of equiposProcesadosLote) {
          if (!esPrimeraPagina) {
            doc.addPage();
          } else {
            esPrimeraPagina = false;
          }

          doc.fontSize(8).font('Times-Bold').text("GymTech", 5, 5, { align: 'left', width: 144 });

          const nombreLimpio = (eq.nombreEquipo || 'SIN NOMBRE').toString().toUpperCase();
          doc.fontSize(7).font('Helvetica-Bold').text(nombreLimpio.substring(0, 35), 0, 16, { align: 'center', width: 144 });

          if (eq.barcodeBuffer) {
            doc.image(eq.barcodeBuffer, 5, 25, { fit: [134, 35], align: 'center' });
            contadorEtiquetasExitosas++;
          } else {
            doc.fontSize(6).text("[ERROR EN CÓDIGO]", 0, 30, { align: 'center', width: 144 });
          }

          doc.fontSize(8).font('Courier-Bold').text(eq.codigo || 'S/C', 0, 58, { align: 'center', width: 144 });
        }

        // Limpieza de memoria del lote
        equiposProcesadosLote.forEach(eq => { if(eq.barcodeBuffer) eq.barcodeBuffer = null; });
      }

      doc.end();

    } catch (error) {
      console.error("\n💥 [BACKEND] CRASH CRÍTICO DENTRO DE GENERAR PDF MASIVO:", error);
      reject(error);
    }
  });
};

module.exports = { generarPdfEtiquetas, generarPdfEtiquetasMasivo };