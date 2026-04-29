import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages is served through a custom domain, so production assets resolve from the root path.
  base: "/",
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      ext: ".gz",
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-vendor": ["antd", "@ant-design/icons"],
        },
      },
    },
  },
});
