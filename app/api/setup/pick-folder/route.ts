import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    if (process.platform === 'win32') {
      const psCommand = `
        Add-Type -AssemblyName System.windows.forms;
        $f = New-Object System.Windows.Forms.FolderBrowserDialog;
        $f.ShowNewFolderButton = $true;
        $f.Description = 'Selecciona la carpeta donde deseas instalar AutoProd';
        if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { 
          Write-Output $f.SelectedPath 
        }
      `;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCommand.replace(/\n/g, ' ')}"`);
      const selectedPath = stdout.trim();
      if (!selectedPath) {
        return NextResponse.json({ success: false, error: 'Cancelado por el usuario' }, { status: 400 });
      }
      return NextResponse.json({ success: true, path: selectedPath });
    } else if (process.platform === 'darwin') {
      const scpt = 'POSIX path of (choose folder with prompt "Selecciona la carpeta donde deseas instalar AutoProd")';
      const { stdout } = await execAsync(`osascript -e '${scpt}'`);
      const selectedPath = stdout.trim();
      if (!selectedPath) {
        return NextResponse.json({ success: false, error: 'Cancelado por el usuario' }, { status: 400 });
      }
      return NextResponse.json({ success: true, path: selectedPath });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'El explorador nativo no está disponible en el servidor en la nube. Por favor escribe o pega la ruta de tu carpeta local directamente o inicia el Motor Local en tu PC.' 
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'No se pudo abrir el explorador del sistema operativo. Puedes ingresar la ruta manualmente.' 
    }, { status: 500 });
  }
}

