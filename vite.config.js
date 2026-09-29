import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: false,
    proxy: {
      '/summary': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/daily-summary': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/endpoints': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/slow': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
    },
  },
});
