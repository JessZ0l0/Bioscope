import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Bioscope/', //
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://clinicaltrials.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});
