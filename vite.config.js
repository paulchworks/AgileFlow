import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/api',             replacement: path.resolve(__dirname, './src/api/index.js') },
      { find: '@/api/entities',    replacement: path.resolve(__dirname, './src/api/entities.js') },
      { find: 'src/api',           replacement: path.resolve(__dirname, './src/api/index.js') },
      { find: 'src/api/entities',  replacement: path.resolve(__dirname, './src/api/entities.js') },
      { find: '/src/api',          replacement: path.resolve(__dirname, './src/api/index.js') },
      { find: '/src/api/entities', replacement: path.resolve(__dirname, './src/api/entities.js') },
      { find: 'api/entities',      replacement: path.resolve(__dirname, './src/api/entities.js') },
      { find: 'api',               replacement: path.resolve(__dirname, './src/api/index.js') },
    ],
  },
});
