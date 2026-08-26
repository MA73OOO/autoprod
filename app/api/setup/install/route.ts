import { NextRequest, NextResponse } from 'next/server';
import { LocalInstaller } from '@/harness/setup/installer';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetOs = url.searchParams.get('os') || 'win32'; // Por defecto asume Windows
    
    // Iniciar instalación asíncrona (en background o esperando)
    // Para simplificar esta demo, lo haremos síncrono. En producción debería ser SSE.
    const result = await LocalInstaller.installPythonPortable(targetOs, (msg) => {
      console.log(`[Setup API - ${targetOs}]:`, msg);
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Motor instalado correctamente', path: result.pythonPath });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

