// vite.config.js
import { resolve } from "path";
import { defineConfig } from "file:///Users/andrewhathaway/code/omnisat/lasereyes-mono/node_modules/.pnpm/vite@5.4.8_@types+node@22.7.5/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/andrewhathaway/code/omnisat/lasereyes-mono/node_modules/.pnpm/vite-plugin-dts@4.2.3_@types+node@22.7.5_typescript@5.6.2_vite@5.4.8/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/andrewhathaway/code/omnisat/lasereyes-mono/packages/lasereyes";
var vite_config_default = defineConfig({
  plugins: [dts()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "index.ts"),
      name: "LaserEyes",
      fileName: "index",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["react", "react-dom"]
      // Should export react and core libraries as a separate output
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYW5kcmV3aGF0aGF3YXkvY29kZS9vbW5pc2F0L2xhc2VyZXllcy1tb25vL3BhY2thZ2VzL2xhc2VyZXllc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FuZHJld2hhdGhhd2F5L2NvZGUvb21uaXNhdC9sYXNlcmV5ZXMtbW9uby9wYWNrYWdlcy9sYXNlcmV5ZXMvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FuZHJld2hhdGhhd2F5L2NvZGUvb21uaXNhdC9sYXNlcmV5ZXMtbW9uby9wYWNrYWdlcy9sYXNlcmV5ZXMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW2R0cygpXSxcbiAgYnVpbGQ6IHtcbiAgICBjb3B5UHVibGljRGlyOiBmYWxzZSxcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC50c1wiKSxcbiAgICAgIG5hbWU6IFwiTGFzZXJFeWVzXCIsXG4gICAgICBmaWxlTmFtZTogXCJpbmRleFwiLFxuICAgICAgZm9ybWF0czogWydlcyddXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAvLyBTaG91bGQgZXhwb3J0IHJlYWN0IGFuZCBjb3JlIGxpYnJhcmllcyBhcyBhIHNlcGFyYXRlIG91dHB1dFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFgsU0FBUyxlQUFlO0FBQ3RaLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUZoQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDZixPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsSUFDZixLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsVUFBVTtBQUFBLE1BQ3BDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDaEI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLFdBQVc7QUFBQTtBQUFBLElBRWpDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
