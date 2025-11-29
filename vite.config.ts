import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      envPrefix: ['VITE_', 'GEMINI_'],
      optimizeDeps: {
        include: [
          'xrpl',
          'xrpl-connect',
          'crypto-browserify',
          'buffer',
          'process',
          'stream-browserify',
          'events'
        ],
      },
      define: {
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          buffer: 'buffer',
          process: 'process/browser',
          stream: 'stream-browserify',
          events: 'events',
          crypto: 'crypto-browserify',
        }
      }
    };
});
