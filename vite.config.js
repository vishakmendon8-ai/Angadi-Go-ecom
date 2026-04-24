import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ IMPORTANT FOR VERCEL DEPLOYMENT
  base: "/",

  // ✅ OPTIONAL BUT GOOD (helps avoid some deploy issues)
  server: {
    host: true,
    port: 5173
  }
})