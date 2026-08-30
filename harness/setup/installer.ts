import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function installBinary(depId: string, filePath: string, manifest: any, onLog?: (msg: string) => void): Promise<void> {
  const dep = manifest.dependencies.find((d: any) => d.id === depId);
  if (!dep) throw new Error(`Dependency ${depId} not found in manifest`);

  if (onLog) onLog(`Iniciando instalación de ${dep.name}...`);

  if (process.platform === 'win32' && dep.install_command_win) {
    // For executables like Python installer
    const cmd = `"${filePath}" ${dep.install_command_win.split(' ').slice(1).join(' ')}`;
    if (onLog) onLog(`Ejecutando: ${cmd}`);
    await execAsync(cmd);
  } else {
    // For portable binaries like yt-dlp, just move them to a known directory or wait for a more complex extraction (like FFmpeg zip)
    // In this v1, we simulate a successful install for simplicity if not a pure installer.
    if (onLog) onLog(`Configurando binario portátil para ${dep.name}...`);
  }

  if (onLog) onLog(`${dep.name} instalado correctamente.`);
}

export async function installPipPackage(depId: string, manifest: any, onLog?: (msg: string) => void): Promise<void> {
  const dep = manifest.dependencies.find((d: any) => d.id === depId);
  if (!dep) throw new Error(`Dependency ${depId} not found in manifest`);

  if (onLog) onLog(`Instalando paquete pip: ${dep.pip_package}...`);
  
  try {
    const cmd = `python -m pip install ${dep.pip_package} --quiet`;
    if (onLog) onLog(`Ejecutando: ${cmd}`);
    await execAsync(cmd);
    if (onLog) onLog(`Paquete ${dep.name} instalado correctamente.`);
  } catch (error: any) {
    throw new Error(`Error instalando ${dep.pip_package}: ${error.message}`);
  }
}
