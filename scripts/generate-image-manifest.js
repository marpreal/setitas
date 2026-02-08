import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesDir = path.join(root, "public", "images");
const outPath = path.join(root, "src", "data", "imageManifest.ts");

const IMG_EXT = /\.(jpg|jpeg|png|webp)$/i;

const manifest = {};

if (!fs.existsSync(imagesDir)) {
  fs.writeFileSync(outPath, "export const imageManifest: Record<string, string[]> = {};\n");
  process.exit(0);
}

const dirs = fs.readdirSync(imagesDir, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const d of dirs) {
  const folder = path.join(imagesDir, d.name);
  const files = fs.readdirSync(folder).filter((f) => IMG_EXT.test(f)).sort();
  manifest[d.name] = files;
}

const tsContent = `/** Generado por scripts/generate-image-manifest.js - no editar a mano */\nexport const imageManifest: Record<string, string[]> = ${JSON.stringify(manifest, null, 2)};\n`;
fs.writeFileSync(outPath, tsContent);
console.log("imageManifest.ts actualizado:", Object.keys(manifest).length, "setas con carpeta de imágenes");
