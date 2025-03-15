import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  // platform: 'node',
  external: ['react', 'react-dom', '@dfinity/agent', '@dfinity/candid', '@dfinity/identity'],
  plugins: [],
});
