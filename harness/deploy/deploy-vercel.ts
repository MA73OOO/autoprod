import { execSync, spawn } from 'child_process';
import path from 'path';

const REPO_ROOT = path.resolve(process.cwd());

console.log('\n================================================================');
console.log('       🚀  AUTOPROD AI - HARNESS DE DESPLIEGUE A PRODUCCIÓN');
console.log('================================================================\n');

async function runStep(stepName: string, command: string): Promise<void> {
  console.log(`\n▶️  [PASO] ${stepName}`);
  console.log(`   > ${command}\n`);

  try {
    execSync(command, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
    console.log(`\n   ✅ ${stepName} completado con éxito.`);
  } catch (err: any) {
    console.error(`\n❌ [ERROR] Falló en: ${stepName}`);
    throw err;
  }
}

async function main() {
  const startTime = Date.now();
  const isDirectVercel = process.argv.includes('--vercel-cli');

  try {
    // 1. Validar variables de entorno
    await runStep('1/4: Validación de Variables de Entorno (.env)', 'pnpm check:env');

    // 2. Aplicar migraciones pendientes en PostgreSQL (Supabase)
    await runStep('2/4: Sincronización & Migración de Base de Datos (Supabase)', 'pnpm db:migrate');

    // 3. Verificación de compilación local Next.js
    await runStep('3/4: Build Local de Validación (Next.js & TypeScript)', 'pnpm build');

    // 4. Despliegue a Producción
    if (isDirectVercel) {
      await runStep('4/4: Despliegue Directo vía Vercel CLI', 'npx vercel --prod');
    } else {
      console.log('\n▶️  [PASO] 4/4: Verificación de Estado de Git para Push a Vercel');
      execSync('pnpm check:git', { cwd: REPO_ROOT, stdio: 'inherit' });
      console.log('\n   💡 Tu base de datos en Supabase ya está 100% migrada y el build pasó sin errores.');
      console.log('   🚀 Puedes hacer: "git push origin main" para que Vercel despliegue inmediatamente.');
    }

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n================================================================');
    console.log(`🎉 ¡PIPELINE DE DESPLIEGUE COMPLETADO EXITOSAMENTE EN ${elapsedSeconds}s!`);
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ [ABORTADO] El despliegue se detuvo para proteger el entorno de producción.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
