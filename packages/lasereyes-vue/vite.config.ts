import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['lib/**/*.ts', 'lib/**/*.tsx', 'lib/**/*.vue'],
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace('/lib/', '/'),
        content,
      }),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'LaserEyesVue',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@omnisat/lasereyes-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@omnisat/lasereyes-core': 'LaserEyesCore',
        },
      },
    },
  },
})
