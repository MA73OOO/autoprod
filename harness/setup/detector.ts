import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

export type DependencyStatus = 'installed' | 'outdated' | 'missing';

export interface DependencyInfo {
  id: string;
  name: string;
  status: DependencyStatus;
  current_version?: string;
  required_version: string;
}

export function getAutoProdRoot() {
  // Creamos la carpeta AutoProd directamente en la carpeta de usuario (Home), 
  // para que sea visible y accesible fácilmente (ej: C:\Users\Juan\AutoProd)
  return path.join(os.homedir(), 'AutoProd');
}

export function getLocalBinPath() {
  return path.join(getAutoProdRoot(), 'bin');
}

export function getWorkspacePath() {
  return path.join(getAutoProdRoot(), 'youtube');
}

export async function detectDependencies(): Promise<DependencyInfo[]> {
  const manifestPath = path.join(process.cwd(), 'harness', 'setup', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestData);

  const results: DependencyInfo[] = [];
  const localBin = getLocalBinPath();

  for (const dep of manifest.dependencies) {
    let output = '';
    let isInstalled = false;
    let current_version = 'unknown';

    // Build the check command. Try local isolated path first if it's a binary
    let cmdToRun = dep.check_command;
    if (dep.type === 'binary') {
      const localExe = process.platform === 'win32' ? dep.local_path_win : dep.local_path_mac;
      if (localExe) {
        const fullPath = path.join(localBin, localExe);
        try {
          // Check if local file exists
          await fs.access(fullPath);
          // If it exists, replace the command prefix with the absolute path
          // E.g. "ffmpeg -version" -> "C:\...\ffmpeg.exe -version"
          cmdToRun = `"${fullPath}" ${dep.check_command.split(' ').slice(1).join(' ')}`;
        } catch (e) {
          // File doesn't exist locally, will fallback to global check_command
        }
      }
    }

    try {
      const { stdout, stderr } = await execAsync(cmdToRun);
      output = (stdout || stderr).trim();
      isInstalled = true;
      
      // Basic version extraction logic
      const versionMatch = output.match(/(\d+\.\d+(\.\d+)?)/);
      if (versionMatch) {
        current_version = versionMatch[1];
      } else if (output.toLowerCase().includes('yt-dlp')) {
        const dateMatch = output.match(/(\d{4}\.\d{2}\.\d{2})/);
        if (dateMatch) current_version = dateMatch[1];
      }

    } catch (err: any) {
      // Missing
    }

    if (isInstalled) {
      results.push({
        id: dep.id,
        name: dep.name,
        status: 'installed',
        current_version,
        required_version: dep.min_version
      });
    } else {
      results.push({
        id: dep.id,
        name: dep.name,
        status: 'missing',
        required_version: dep.min_version
      });
    }
  }

  return results;
}
