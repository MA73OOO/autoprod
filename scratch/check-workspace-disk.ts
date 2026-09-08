import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getWorkspacePath } from '../harness/setup/detector';

const ws = getWorkspacePath();
console.log('Workspace Path:', ws);
if (ws && fs.existsSync(ws)) {
  const dirs = fs.readdirSync(ws);
  console.log('Folders in workspace:', dirs);
  for (const d of dirs) {
    const full = path.join(ws, d);
    if (fs.statSync(full).isDirectory()) {
      console.log(`Contents of ${d}:`, fs.readdirSync(full));
      const infoCanal = path.join(full, 'InfoCanal');
      if (fs.existsSync(infoCanal)) {
        console.log(`  Contents of ${d}/InfoCanal:`, fs.readdirSync(infoCanal));
      }
    }
  }
}
