import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

import net from 'net';

const execAsync = promisify(exec);

// Configuramos la instalación dentro de la carpeta del proyecto actual
const PROJECT_ROOT = process.cwd();
const INSTALL_DIR = path.join(PROJECT_ROOT, '.autoprod', 'python');
const PYTHON_URL = 'https://www.python.org/ftp/python/3.10.11/python-3.10.11-embed-amd64.zip';
const GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py';

export class LocalInstaller {
  /**
   * Verifica si un puerto está libre en localhost
   */
  static async checkPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true); // Tratamos otros errores como disponibles o manejables luego
        }
      });
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port, '127.0.0.1');
    });
  }

  /**
   * Descarga y configura un entorno de Python Portable local.
   */
  static async installPythonPortable(targetOs: string = process.platform, port: number = 8000, onProgress?: (msg: string) => void) {
    const log = (msg: string) => {
      console.log(msg);
      if (onProgress) onProgress(msg);
    };

    try {
      // Verificar si el puerto está libre antes de hacer nada
      const isAvailable = await LocalInstaller.checkPortAvailable(port);
      if (!isAvailable) {
        return { success: false, error: 'PORT_IN_USE', port };
      }
      // 1. Crear directorios
      log('Preparando directorios de instalación...');
      await fs.mkdir(INSTALL_DIR, { recursive: true });

      const zipPath = path.join(INSTALL_DIR, 'python.zip');
      const getPipPath = path.join(INSTALL_DIR, 'get-pip.py');
      const pythonExe = path.join(INSTALL_DIR, 'python.exe');

      // 2. Descargar Python si no existe
      if (!existsSync(pythonExe)) {
        log(`Descargando Python Portable para ${targetOs}...`);
        
        if (targetOs === 'win32') {
          // Lógica Windows (PowerShell)
          await execAsync(`powershell -Command "Invoke-WebRequest -Uri '${PYTHON_URL}' -OutFile '${zipPath}'"`);
          log('Extrayendo Python...');
          await execAsync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${INSTALL_DIR}' -Force"`);
          await fs.unlink(zipPath); // Limpiar zip

          // Modificar el archivo _pth (solo en Windows embeddable) para habilitar pip
          log('Configurando entorno Windows...');
          const pthPath = path.join(INSTALL_DIR, 'python310._pth');
          let pthContent = await fs.readFile(pthPath, 'utf8');
          pthContent = pthContent.replace('#import site', 'import site');
          await fs.writeFile(pthPath, pthContent);

        } else if (targetOs === 'darwin') {
          // Lógica Mac (Standalone Python Build)
          const MAC_PYTHON = "https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.10.13+20240107-aarch64-apple-darwin-install_only.tar.gz";
          const tarPath = path.join(INSTALL_DIR, 'python.tar.gz');
          
          await execAsync(`curl -L -o '${tarPath}' '${MAC_PYTHON}'`);
          log('Extrayendo Python...');
          await execAsync(`tar -xzf '${tarPath}' -C '${INSTALL_DIR}' --strip-components=1`);
          await fs.unlink(tarPath); // Limpiar tar
        } else {
          throw new Error('Sistema operativo no soportado por el instalador desatendido.');
        }
      } else {
        log('Python Portable ya está instalado.');
      }

      // 4. Instalar pip si no existe
      const isWin = targetOs === 'win32';
      const actualPythonExe = isWin ? path.join(INSTALL_DIR, 'python.exe') : path.join(INSTALL_DIR, 'bin', 'python3');
      const pipPath = isWin ? path.join(INSTALL_DIR, 'Scripts', 'pip.exe') : path.join(INSTALL_DIR, 'bin', 'pip3');

      if (!existsSync(pipPath)) {
        log('Descargando pip...');
        await execAsync(`curl -sSLo '${getPipPath}' '${GET_PIP_URL}' || powershell -Command "Invoke-WebRequest -Uri '${GET_PIP_URL}' -OutFile '${getPipPath}'"`);
        
        log('Instalando pip...');
        await execAsync(`"${actualPythonExe}" "${getPipPath}"`);
      }

      // 5. Instalar requirements.txt del controlador
      log('Instalando dependencias del motor local...');
      const reqPath = path.join(PROJECT_ROOT, 'controlador', 'requirements.txt');
      if (existsSync(reqPath)) {
        await execAsync(`"${actualPythonExe}" -m pip install -r "${reqPath}"`);
      }

      // 6. Configurar Protocolo Custom (autoprod://) y Auto-Arranque
      log('Configurando Protocolo y Auto-arranque silencioso...');
      
      const motorDir = path.join(PROJECT_ROOT, 'controlador');
      let launcherCmd = '';

      if (isWin) {
        // Crear script VBS para ejecución silenciosa (sin consola)
        const vbsPath = path.join(INSTALL_DIR, 'run_motor.vbs');
        const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "${motorDir}"
WshShell.Run "cmd /c """"${actualPythonExe}"""" -m uvicorn main:app --port ${port} --host 127.0.0.1", 0, False
        `.trim();
        await fs.writeFile(vbsPath, vbsContent);

        // Registrar en Regedit (HKCU)
        const psReg = `
$base = 'HKCU:\\Software\\Classes\\autoprod'
New-Item -Path $base -Force | Out-Null
New-ItemProperty -Path $base -Name '(default)' -Value 'URL:AutoProd Motor Protocol' -Force | Out-Null
New-ItemProperty -Path $base -Name 'URL Protocol' -Value '' -Force | Out-Null
New-Item -Path "$base\\shell\\open\\command" -Force | Out-Null
New-ItemProperty -Path "$base\\shell\\open\\command" -Name '(default)' -Value 'wscript.exe "${vbsPath}"' -Force | Out-Null
        `.trim();
        await execAsync(`powershell -NoProfile -Command "${psReg}"`);
        
        launcherCmd = `wscript.exe "${vbsPath}"`;

      } else {
        // Mac: Crear bash script y AppleScript applet para el protocolo
        const shPath = path.join(INSTALL_DIR, 'run_motor.sh');
        const shContent = `#!/bin/bash\ncd "${motorDir}"\nnohup "${actualPythonExe}" -m uvicorn main:app --port ${port} --host 127.0.0.1 > /dev/null 2>&1 &\n`;
        await fs.writeFile(shPath, shContent);
        await execAsync(`chmod +x "${shPath}"`);

        // Registrar en Mac usando osacompile para crear una .app rápida
        const appPath = path.join(INSTALL_DIR, 'AutoProdMotor.app');
        const asContent = `do shell script "${shPath}"`;
        await execAsync(`osacompile -o "${appPath}" -e '${asContent}'`);
        
        // Modificar Info.plist para asociar el protocolo autoprod://
        const plistEdit = `/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" -c "Add :CFBundleURLTypes:0 dict" -c "Add :CFBundleURLTypes:0:CFBundleURLName string 'AutoProd Motor'" -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string 'autoprod'" "${appPath}/Contents/Info.plist"`;
        await execAsync(plistEdit).catch(() => {}); // ignore if already exists
        await execAsync(`open -a "${appPath}"`); // Registrar con Launch Services
        
        launcherCmd = `"${shPath}"`;
      }

      // 7. Arrancar inmediatamente
      log('Iniciando el Motor en segundo plano...');
      exec(launcherCmd); // No await, es un proceso detached

      log('¡Instalación completada exitosamente! El Motor ya está corriendo.');
      return { success: true, pythonPath: actualPythonExe };

    } catch (error: any) {
      log(`Error durante la instalación: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
