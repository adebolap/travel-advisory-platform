import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define client directory explicitly
const clientDir = path.resolve(__dirname, "client");

// Log important paths for debugging
console.log("Client directory:", clientDir);
console.log("main.tsx path:", path.join(clientDir, "src", "main.tsx"));
console.log("main.tsx exists:", fs.existsSync(path.join(clientDir, "src", "main.tsx")));

// Use a function-based configuration to handle async operations
export default defineConfig(async () => {
  // Conditionally load the cartographer plugin
  const devPlugins = [];
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const cartographerModule = await import("@replit/vite-plugin-cartographer");
      devPlugins.push(cartographerModule.cartographer());
    } catch (err) {
      console.warn("Failed to load cartographer plugin:", err);
    }
  }

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      ...devPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(clientDir, "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: clientDir,
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: '0.0.0.0',
      hmr: {
        clientPort: 443,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
});