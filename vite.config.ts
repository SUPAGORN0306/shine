import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ตั้งค่า base ให้ตรงกับชื่อ GitHub repository เพื่อให้ asset path ถูกต้องบน GitHub Pages
// (repo: shine → https://<user>.github.io/shine/)
export default defineConfig({
  plugins: [react()],
  base: '/shine/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
