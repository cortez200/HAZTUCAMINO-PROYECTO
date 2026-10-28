// Genera client/public/catalog.json como respaldo del catálogo.
// Permite que la web cargue (solo lectura) cuando no hay API detrás:
// preview de Vite, hosting estático o GitHub Pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const data = await import(pathToFileURL(path.join(root, 'server', 'data.js')).href);

const catalog = {
  areas: data.AREAS,
  careers: data.CARRERAS,
  preguntas: data.PREGUNTAS,
  opciones: data.OPCIONES,
  niveles: data.NIVELES,
  universities: data.UNIVERSIDADES,
  plans: data.PLANS,
  freeTestLimit: data.FREE_TEST_LIMIT
};

const out = path.join(root, 'client', 'public', 'catalog.json');
fs.writeFileSync(out, JSON.stringify(catalog));
console.log(`[catalog] Respaldo generado: client/public/catalog.json (${(fs.statSync(out).size / 1024).toFixed(0)} kB)`);
