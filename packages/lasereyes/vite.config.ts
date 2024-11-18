import { resolve } from 'path'
import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Adds an entry point for types, ensuring `types` is correctly referenced in package.json
      tsconfigPath: resolve(__dirname, './tsconfig.build.json'),
    }),
  ] as UserConfig['plugins'],
  build: {
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: 'lasereyes',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        banner: "'use client';",
      },
    },
  },
})
