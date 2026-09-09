import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const osParam = searchParams.get('os')?.toLowerCase();
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';

    const isMac = osParam === 'mac' || osParam === 'macos' || (!osParam && userAgent.includes('mac'));

    let fileName = isMac ? 'install-macos.sh' : 'install-windows.bat';
    let downloadName = isMac ? 'autoprod-setup.sh' : 'autoprod-setup.bat';
    let contentType = isMac ? 'application/x-sh' : 'application/x-bat';

    const scriptPath = path.join(process.cwd(), 'scripts', 'installer', fileName);
    
    // Leer el script instalador
    const fileContent = await fs.readFile(scriptPath, 'utf-8');

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('Error serving installer script:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo generar el instalador' },
      { status: 500 }
    );
  }
}
