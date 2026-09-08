import fs from 'fs';
import path from 'path';
import { getWorkspacePath } from '../harness/setup/detector';

const ws = getWorkspacePath() || '';
const testFolder = path.join(ws, 'El Abrazo del Padre worship', '🌊 EN LAS AGUAS DE SU AMOR - Reggae Gospel para Tu Alma 🕊️');
if (fs.existsSync(testFolder)) {
  fs.rmSync(testFolder, { recursive: true, force: true });
  console.log('Cleaned up test folder:', testFolder);
}
