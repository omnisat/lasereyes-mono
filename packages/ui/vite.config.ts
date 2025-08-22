import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
// import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // nodePolyfills({
    //   include: ["buffer"],
    // }),
    dts({ tsconfigPath: "./tsconfig.build.json" }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@kevinoyl/lasereyes",
      ],
      output: {
        entryFileNames: "[name].js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@kevinoyl/lasereyes": "Lasereyes",
        },
      },
    },
  },
})
