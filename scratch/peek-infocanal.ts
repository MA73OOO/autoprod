import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getWorkspacePath } from '../harness/setup/detector';

const ws = getWorkspacePath();
const chFolder = path.join(ws || '', 'El Abrazo del Padre worship', 'InfoCanal');
console.log('Exists:', fs.existsSync(chFolder));
if (fs.existsSync(chFolder)) {
  for (const f of ['Contexto_canal.md', 'Metricas_canal.md', 'Historial_canal.md']) {
    const full = path.join(chFolder, f);
    if (fs.existsSync(full)) {
      console.log(`\n=== ${f} (First 200 chars) ===`);
      console.log(fs.readFileSync(full, 'utf-8').slice(0, 200));
    }
  }
}
