import { NextRequest, NextResponse } from 'next/server';
import { setupEmitter } from '../stream/route';
import { detectDependencies } from '@/harness/setup/detector';
import { downloadFile } from '@/harness/setup/downloader';
import { installBinary, installPipPackage } from '@/harness/setup/installer';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const manifestPath = path.join(process.cwd(), 'harness', 'setup', 'manifest.json');
    const manifestData = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestData);

    const dependencies = await detectDependencies();
    const toInstall = dependencies.filter(dep => dep.status !== 'installed');

    if (toInstall.length === 0) {
      return NextResponse.json({ success: true, message: 'Todas las dependencias ya están instaladas.' });
    }

    // Ejecutar instalación en background para no bloquear el request
    runSetupTask(toInstall, manifest).catch(err => {
      console.error('Setup task failed:', err);
      setupEmitter.emit('error', err.message);
    });

    return NextResponse.json({ success: true, message: 'Instalación iniciada' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function runSetupTask(toInstall: any[], manifest: any) {
  setupEmitter.emit('log', 'Iniciando proceso de instalación de dependencias...');

  for (let i = 0; i < toInstall.length; i++) {
    const depStatus = toInstall[i];
    const depDef = manifest.dependencies.find((d: any) => d.id === depStatus.id);
    
    if (!depDef) continue;
    
    setupEmitter.emit('progress', Math.round((i / toInstall.length) * 100));

    if (depDef.type === 'binary') {
      setupEmitter.emit('log', `Descargando ${depDef.name}...`);
      const url = process.platform === 'win32' ? depDef.windows_url : depDef.mac_url;
      
      if (!url) {
        setupEmitter.emit('log', `⚠️ No hay URL de descarga para ${depDef.name} en ${process.platform}. Saltando.`);
        continue;
      }
      
      const fileName = url.split('/').pop() || `${depDef.id}.download`;
      const tempPath = path.join(os.tmpdir(), fileName);
      
      try {
        await downloadFile(url, tempPath, (progress) => {
          // You could emit detailed progress here if desired, 
          // but for now just general progress is fine to avoid flooding SSE
        });
        
        await installBinary(depDef.id, tempPath, manifest, (msg) => {
          setupEmitter.emit('log', msg);
        });
      } catch (err: any) {
        setupEmitter.emit('log', `❌ Error instalando ${depDef.name}: ${err.message}`);
      }
    } else if (depDef.type === 'pip') {
      try {
        await installPipPackage(depDef.id, manifest, (msg) => {
          setupEmitter.emit('log', msg);
        });
      } catch (err: any) {
        setupEmitter.emit('log', `❌ Error instalando ${depDef.name}: ${err.message}`);
      }
    }
  }

  setupEmitter.emit('progress', 100);
  setupEmitter.emit('log', '✅ Proceso de instalación completado.');
  setupEmitter.emit('complete');
}
