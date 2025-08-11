import { resolve } from 'path'
import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() as UserConfig['plugins'],
    dts({
      insertTypesEntry: true, // Adds an entry point for types, ensuring `types` is correctly referenced in package.json
      tsconfigPath: resolve(__dirname, './tsconfig.build.json'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'lasereyes-react',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@omnisat/lasereyes-core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@omnisat/lasereyes-core': 'LasereyesCore',
        },
        banner: "'use client';",
      },
    },
  },
})
