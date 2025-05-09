import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // nodePolyfills({
    //   include: ["buffer"],
    // }),
    dts({ tsconfigPath: "./tsconfig.build.json" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@omnisat/lasereyes",
      ],
      output: {
        entryFileNames: "[name].js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
        },
      },
    },
  },
});
