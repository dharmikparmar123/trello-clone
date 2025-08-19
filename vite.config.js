import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// react plugin is optional for simple apps, but helpful
export default defineConfig({
  plugins: [react()],
  server: { port: 3000}
})
