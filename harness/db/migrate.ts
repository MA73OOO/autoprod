import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

const { Pool } = pg;

// 1. Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REPO_ROOT = path.resolve(process.cwd());
const MIGRATIONS_DIR = path.join(REPO_ROOT, 'migrations');

console.log('\n================================================================');
console.log('       🗄️  AUTOPROD AI - HARNESS DE MIGRACIONES SQL (POSTGRES)');
console.log('================================================================\n');

function getDatabaseUrl(): string {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ [ERROR] No se encontró DIRECT_URL ni DATABASE_URL en el archivo .env.');
    process.exit(1);
  }
  return url;
}

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

async function ensureMigrationTable(client: pg.PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _autoprod_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW(),
      execution_time_ms INTEGER NOT NULL
    );
  `);
}

async function getAppliedMigrations(client: pg.PoolClient): Promise<Map<string, { checksum: string; applied_at: Date }>> {
  const res = await client.query(`SELECT filename, checksum, applied_at FROM _autoprod_migrations ORDER BY id ASC`);
  const map = new Map();
  for (const row of res.rows) {
    map.set(row.filename, { checksum: row.checksum, applied_at: row.applied_at });
  }
  return map;
}

function getSortedMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !fs.statSync(path.join(MIGRATIONS_DIR, f)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function main() {
  const isStatusOnly = process.argv.includes('--status');
  const dbUrl = getDatabaseUrl();

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  let client: pg.PoolClient | null = null;

  try {
    console.log('🔌 Conectando a la Base de Datos PostgreSQL...');
    client = await pool.connect();
    console.log('   ✅ Conexión establecida con éxito.\n');

    await ensureMigrationTable(client);
    const appliedMap = await getAppliedMigrations(client);
    const migrationFiles = getSortedMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No se encontraron archivos .sql en la carpeta migrations/.');
      return;
    }

    if (isStatusOnly) {
      console.log('📊 Estado de Migraciones Registradas:\n');
      console.log('--------------------------------------------------------------------------------------');
      console.log(`| Archivo Migración                               | Estado     | Fecha de Aplicación  |`);
      console.log('--------------------------------------------------------------------------------------');
      for (const file of migrationFiles) {
        const applied = appliedMap.get(file);
        const statusLabel = applied ? '✅ APLICADA' : '⏳ PENDIENTE';
        const dateLabel = applied ? new Date(applied.applied_at).toLocaleString() : '---';
        console.log(`| ${file.padEnd(48)} | ${statusLabel.padEnd(10)} | ${dateLabel.padEnd(20)} |`);
      }
      console.log('--------------------------------------------------------------------------------------\n');
      return;
    }

    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      const checksum = calculateChecksum(sqlContent);

      if (appliedMap.has(file)) {
        console.log(`   ⏩ [SKIP] ${file} (Ya aplicada previamente)`);
        skippedCount++;
        continue;
      }

      console.log(`\n🚀 [APPLYING] Ejecutando: ${file}...`);
      const startTime = Date.now();

      try {
        await client.query('BEGIN');
        await client.query(sqlContent);
        const duration = Date.now() - startTime;

        await client.query(
          `INSERT INTO _autoprod_migrations (filename, checksum, execution_time_ms) VALUES ($1, $2, $3)`,
          [file, checksum, duration]
        );
        await client.query('COMMIT');

        console.log(`   ✅ [APPLIED] ${file} finalizada exitosamente en ${duration}ms.`);
        appliedCount++;
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(`\n❌ [ERROR FATAL] Falló la migración ${file}:`);
        console.error(`   ${err.message}\n`);
        throw err;
      }
    }

    console.log('\n----------------------------------------------------------------');
    console.log(`🎉 Resumen de Migraciones: ${appliedCount} aplicadas nuevas, ${skippedCount} omitidas.`);
    console.log('----------------------------------------------------------------\n');

    // Sincronizar Prisma Client si se aplicaron nuevas migraciones
    if (appliedCount > 0) {
      console.log('🔄 Sincronizando Prisma Client con el nuevo esquema...');
      try {
        execSync('pnpm exec prisma generate', { stdio: 'inherit', cwd: REPO_ROOT });
        console.log('   ✅ Prisma Client regenerado y sincronizado con TypeScript.\n');
      } catch (e: any) {
        console.warn('   ⚠️  No se pudo ejecutar prisma generate automáticamente:', e.message);
      }
    }
  } catch (err: any) {
    console.error('\n❌ Proceso de migración abortado:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
