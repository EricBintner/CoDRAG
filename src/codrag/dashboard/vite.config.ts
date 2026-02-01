import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const uiSrcPath = new URL('../../../packages/ui/src', import.meta.url).pathname
const repoRootPath = new URL('../../..', import.meta.url).pathname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@codrag/ui': uiSrcPath,
    },
  },
  server: {
    port: 5174,
    fs: {
      allow: [repoRootPath],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8400',
        changeOrigin: true,
      },
    },
  },
})
