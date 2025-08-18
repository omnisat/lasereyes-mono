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
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'lasereyes',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: {
        index: resolve(__dirname, './src/index.ts'),
      },
      output: {
        dir: resolve(__dirname, './dist'),
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'es',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        banner: "'use client';",
      },
    },
  },
})
