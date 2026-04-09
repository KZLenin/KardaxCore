const multer = require('multer');

// Usamos memoryStorage para no guardar el archivo en el disco duro del servidor.
// Lo mantenemos en memoria (buffer) solo el tiempo suficiente para enviarlo a Supabase.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Validamos que solo sean imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo se permiten imágenes.'));
    }
  }
});

module.exports = upload;