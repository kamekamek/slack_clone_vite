import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'react', 'react-dom']
  },
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https: https://fonts.gstatic.com; connect-src 'self' https:;"
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
