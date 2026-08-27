import { NextRequest, NextResponse } from 'next/server';
import { LocalInstaller } from '@/harness/setup/installer';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetOs = url.searchParams.get('os') || 'win32'; // Por defecto asume Windows
    
    let port = 8000;
    try {
      const body = await req.json();
      if (body && body.port) {
        port = parseInt(body.port);
      }
    } catch (e) {
      // Si no hay body o falla el json, ignoramos y usamos 8000
    }
    
    // Iniciar instalación asíncrona (en background o esperando)
    const result = await LocalInstaller.installPythonPortable(targetOs, port, (msg) => {
      console.log(`[Setup API - ${targetOs}]:`, msg);
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Motor instalado correctamente', path: result.pythonPath });
    } else {
      if (result.error === 'PORT_IN_USE') {
        return NextResponse.json({ success: false, error: 'PORT_IN_USE', port }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

