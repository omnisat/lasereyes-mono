import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
// import reactRefresh from '@vitejs/plugin-react-refresh';
// import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // target: 'es2016',
      define: {
        global: 'globalThis',
      },
      supported: {
        bigint: true,
      },
      jsx: 'automatic',
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        //生产环境时移除console
        drop_console: process.env.PROVIDER ? true : false,
        drop_debugger: process.env.PROVIDER ? true : false,
      },
    },
  },

  plugins: [
    // reactRefresh(),
    react(),
    wasm(),

    // legacy(),
    nodePolyfills({
      // Specific modules that should not be polyfilled.
      exclude: [],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: false, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: false,
      // overrides: {
      //   buffer: 'buffer/',
      // },
    }),
    createHtmlPlugin({
      minify: true,
    }),
  ],
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    'process.env.PROVIDER': process.env.PROVIDER ? JSON.stringify(process.env.PROVIDER) : JSON.stringify('avqkn-guaaa-aaaaa-qaaea-cai'),
  },
});
