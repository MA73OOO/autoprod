import { LocalInstaller } from './harness/setup/installer';

async function run() {
  console.log('--- Iniciando Setup Automático ---');
  await LocalInstaller.installPythonPortable((msg) => {
    // Escuchar el progreso en vivo
    console.log('[PROGRESO]:', msg);
  });
}

run();
