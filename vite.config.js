import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load all env vars (both VITE_* and others) from .env files
  const env = loadEnv(mode, process.cwd(), '');

  const DEV_PROXY_TARGET =
    env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000'; // only used in dev

  return {
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
        { find: 'date-fns/formatDistanceToNow', replacement: path.resolve(__dirname, './src/shims/formatDistanceToNow-safe.js') },
        { find: 'date-fns/formatDistance',      replacement: path.resolve(__dirname, './src/shims/formatDistance-safe.js') },
        // These catch both '.../formatDistance(.mjs)?' and '.../formatDistanceToNow(.mjs)?'
        { find: /date-fns\/formatDistanceToNow(\.mjs)?$/, replacement: path.resolve(__dirname, './src/shims/formatDistanceToNow-safe.js') },
        { find: /date-fns\/formatDistance(\.mjs)?$/,      replacement: path.resolve(__dirname, './src/shims/formatDistance-safe.js') },
      ],
    },

    optimizeDeps: {
      include: ['@hello-pangea/dnd'],
    },

    build: {
      sourcemap: true,
      commonjsOptions: { transformMixedEsModules: true },
    },

    server: {
      proxy: {
        // Calls to "/api/*" in the app will be proxied to your backend in dev
        '/api': {
          target: DEV_PROXY_TARGET,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api/, ''), // "/api/foo" -> "/foo"
        },
      },
    },
  };
});

