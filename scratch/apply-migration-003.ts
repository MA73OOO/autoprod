import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Applying migration 003_baseline_orchestrator_and_prompts.sql...');
  const sqlPath = path.join(process.cwd(), 'migrations', '003_baseline_orchestrator_and_prompts.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Execute using prisma raw query
  await prisma.$executeRawUnsafe(sql);
  console.log('Migration 003 applied successfully!');

  // Verify
  const promptCount = await prisma.promptTemplate.count();
  const toolRecord = await prisma.tool.findUnique({ where: { name: 'consultar_prompts' } });
  console.log(`PromptTemplate count in DB: ${promptCount}`);
  console.log(`Tool 'consultar_prompts' in DB:`, toolRecord?.name);
}

main()
  .catch(err => {
    console.error('Error applying migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
