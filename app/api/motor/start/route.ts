import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { getLocalBinPath } from '@/harness/setup/detector';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const port = body.port || 8000;
    const cwd = path.join(process.cwd(), 'controlador');

    const localBin = getLocalBinPath();
    const workspacePython = path.join(process.cwd(), '.autoprod', 'python', 'python.exe');

    let pythonCmd = 'python';

    if (fs.existsSync(workspacePython)) {
      pythonCmd = workspacePython;
    } else if (localBin) {
      const winPython = path.join(localBin, 'python.exe');
      const macPython = path.join(localBin, 'python3');
      if (fs.existsSync(winPython)) {
        pythonCmd = winPython;
      } else if (fs.existsSync(macPython)) {
        pythonCmd = macPython;
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'AutoProd no está instalado. Ve a Configuración (Engranaje) > Sistema > Instalar Motor para configurarlo.' },
        { status: 400 }
      );
    }

    // Spawn the python process detached so it runs in the background
    const child = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--port', String(port)], {
      cwd,
      detached: true,
      stdio: 'ignore', // Ignoramos stdout/stderr para que no bloquee Next.js
      windowsHide: true,
      env: { ...process.env, PATH: `${localBin}${path.delimiter}${process.env.PATH}` }
    });
    
    child.unref();

    return NextResponse.json({ success: true, message: 'Motor arrancado en segundo plano' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
