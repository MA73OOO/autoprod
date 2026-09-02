import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const psCommand = `
      Add-Type -AssemblyName System.windows.forms;
      $f = New-Object System.Windows.Forms.FolderBrowserDialog;
      $f.ShowNewFolderButton = $true;
      $f.Description = 'Selecciona la carpeta donde deseas instalar AutoProd';
      if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { 
        Write-Output $f.SelectedPath 
      }
    `;

    // Ejecutamos powershell
    const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCommand.replace(/\n/g, ' ')}"`);
    const selectedPath = stdout.trim();

    if (!selectedPath) {
      return NextResponse.json({ success: false, error: 'Cancelado por el usuario' }, { status: 400 });
    }

    return NextResponse.json({ success: true, path: selectedPath });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
