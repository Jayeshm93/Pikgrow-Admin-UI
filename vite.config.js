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
      '/api/v1/analytics': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/analytics/, ''),
      },
      '/dashboard': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/crops': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        autoRewrite: true,
        cookieDomainRewrite: '',
      },
      '/statics': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
    },
  },
});
