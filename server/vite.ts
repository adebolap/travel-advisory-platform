import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Determine the client directory
  const clientDir = path.resolve(__dirname, "..", "client");
  const mainTsxPath = path.resolve(clientDir, "src", "main.tsx");

  // Log paths for debugging
  log(`Client directory: ${clientDir}`, "vite");
  log(`main.tsx path: ${mainTsxPath}`, "vite");
  log(`main.tsx exists: ${fs.existsSync(mainTsxPath)}`, "vite");

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Don't exit on error during development
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      },
    },
    root: clientDir, // Explicitly set the root to client directory
    server: {
      middlewareMode: "html",
      hmr: { server },
      allowedHosts: [
        "localhost",
        ".localhost",
        "7712524e-0d33-4a27-8db8-8c64fbeec949-00-f9vk81xjgm15.worf.replit.dev",
        ".replit.dev"
      ],
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: "custom",
    resolve: {
      alias: {
        "@": path.resolve(clientDir, "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
      },
    },
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(clientDir, "index.html");

      if (!fs.existsSync(clientTemplate)) {
        log("Client index.html not found", "vite");
        return res.status(404).send("Client index.html not found");
      }

      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // Don't modify the script tag - let Vite handle this
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}