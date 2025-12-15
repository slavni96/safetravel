import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set base for GitHub Pages (repo name). Adjust if deploying elsewhere.
  base: '/safetravel/',
  plugins: [react()],
})
