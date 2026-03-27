const { createClient } = require('@supabase/supabase-js');

// Verificamos que las variables de entorno existan antes de intentar conectar
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Error Crítico: Faltan las credenciales de Supabase en el archivo .env');
  process.exit(1); // Detenemos el servidor si no hay base de datos
}

// Inicializamos el cliente
// OJO: En el backend usamos la SERVICE_KEY, no la llave anónima (anon key) pública.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false, // Como es un backend (servidor a servidor), no necesitamos guardar cookies de sesión
    }
  }
);

console.log('✅ Cliente de Supabase configurado correctamente');

module.exports = supabase;