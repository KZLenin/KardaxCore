import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,       // 🔥 esto es lo importante
    port: 5173        // opcional, pero lo dejas fijo
  }
})