import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "fs";

// Struktur flat (tanpa folder public): salin aset statis ke dist saat build.
const assets = ["favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "manifest.webmanifest", "sw.js"];
const copyAssets = () => ({
  name: "copy-static-assets",
  closeBundle() { for (const f of assets) if (existsSync(f)) copyFileSync(f, "dist/" + f); },
});

export default defineConfig({ plugins: [react(), copyAssets()], build: { target: "es2019" } });
