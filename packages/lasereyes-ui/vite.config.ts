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
        "@omnisat/lasereyes",
        "@omnisat/lasereyes-core",
        "@omnisat/lasereyes-react",
      ],
      output: {
        entryFileNames: "[name].js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@omnisat/lasereyes": "Lasereyes",
          "@omnisat/lasereyes-core": "LasereyesCore",
          "@omnisat/lasereyes-react": "LasereyesReact",
        },
      },
    },
  },
});
