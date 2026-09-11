import { execSync } from 'child_process';

console.log('\n🔍 [Harness] Verificando estado del repositorio Git...');

try {
  const isGit = execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  if (isGit !== 'true') {
    console.error('❌ [ERROR] El directorio actual no es un repositorio de Git activo.');
    process.exit(1);
  }

  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  if (status) {
    console.log('⚠️  [ADVERTENCIA] Tienes cambios pendientes o archivos sin confirmar en Git:');
    console.log(status);
  } else {
    console.log('✅ [OK] El espacio de trabajo de Git está completamente limpio y sincronizado.');
  }
} catch (err: any) {
  console.error('❌ [ERROR] No se pudo comprobar el estado de Git:', err.message);
  process.exit(1);
}
