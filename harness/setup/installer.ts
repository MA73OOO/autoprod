import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { getLocalBinPath } from './detector';

const execAsync = promisify(exec);

export async function installBinary(depId: string, filePath: string, manifest: any, onLog?: (msg: string) => void): Promise<void> {
  const dep = manifest.dependencies.find((d: any) => d.id === depId);
  if (!dep) throw new Error(`Dependency ${depId} not found in manifest`);

  const localBin = getLocalBinPath();
  await fs.mkdir(localBin, { recursive: true });

  if (onLog) onLog(`Iniciando instalación de ${dep.name}...`);

  if (depId === 'python') {
    if (process.platform === 'win32' && dep.install_command_win) {
      const cmd = `"${filePath}" ${dep.install_command_win}`;
      if (onLog) onLog(`Ejecutando: ${cmd}`);
      await execAsync(cmd);
    } else if (process.platform === 'darwin' && dep.install_command_mac) {
      const cmd = dep.install_command_mac.replace('{FILE}', `"${filePath}"`);
      if (onLog) onLog(`Ejecutando: ${cmd}`);
      await execAsync(cmd);
    }
  } else if (depId === 'ffmpeg') {
    if (onLog) onLog(`Extrayendo ${dep.name}...`);
    // Usamos tar, que está disponible en Windows 10+ y macOS
    const extractDir = path.join(os.tmpdir(), `ffmpeg_extract_${Date.now()}`);
    await fs.mkdir(extractDir, { recursive: true });
    
    await execAsync(`tar -xf "${filePath}" -C "${extractDir}"`);
    
    // Buscar el binario dentro del directorio extraído
    const findBinary = async (dir: string, targetName: string): Promise<string | null> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const result = await findBinary(fullPath, targetName);
          if (result) return result;
        } else if (entry.name === targetName) {
          return fullPath;
        }
      }
      return null;
    };

    const targetExe = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    const foundPath = await findBinary(extractDir, targetExe);
    
    if (foundPath) {
      const destPath = path.join(localBin, targetExe);
      await fs.copyFile(foundPath, destPath);
      if (process.platform !== 'win32') {
        await execAsync(`chmod +x "${destPath}"`);
      }
      if (onLog) onLog(`Copiado ${targetExe} a ${destPath}`);
    } else {
      throw new Error(`No se encontró el binario ${targetExe} en el archivo descargado.`);
    }
  } else if (depId === 'yt-dlp') {
    const targetExe = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const destPath = path.join(localBin, targetExe);
    await fs.copyFile(filePath, destPath);
    if (process.platform !== 'win32') {
      await execAsync(`chmod +x "${destPath}"`);
    }
    if (onLog) onLog(`Copiado ${targetExe} a ${destPath}`);
  } else {
    if (onLog) onLog(`Configurando binario portátil para ${dep.name}...`);
  }

  if (onLog) onLog(`${dep.name} instalado correctamente.`);
}

export async function installPipPackage(depId: string, manifest: any, onLog?: (msg: string) => void): Promise<void> {
  const dep = manifest.dependencies.find((d: any) => d.id === depId);
  if (!dep) throw new Error(`Dependency ${depId} not found in manifest`);

  if (onLog) onLog(`Instalando paquete pip: ${dep.pip_package}...`);
  
  try {
    // Intenta usar el python3 global o python
    const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
    const cmd = `${pyCmd} -m pip install ${dep.pip_package} --quiet`;
    if (onLog) onLog(`Ejecutando: ${cmd}`);
    await execAsync(cmd);
    if (onLog) onLog(`Paquete ${dep.name} instalado correctamente.`);
  } catch (error: any) {
    throw new Error(`Error instalando ${dep.pip_package}: ${error.message}`);
  }
}
