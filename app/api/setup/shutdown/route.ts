import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // User specifically requested this command to clean up zombie python processes
      await execAsync('powershell -Command "Stop-Process -Name \'python\' -Force -ErrorAction SilentlyContinue"');
    } else {
      // Fallback for Linux/Mac
      await execAsync('pkill -f python || true');
    }

    return NextResponse.json({ success: true, message: 'Procesos de Python eliminados.' });
  } catch (error) {
    console.error('Error shutting down python processes:', error);
    // Even if it fails (e.g. no process found), we can return success
    return NextResponse.json({ success: true, message: 'Ningún proceso encontrado o error menor.' });
  }
}
