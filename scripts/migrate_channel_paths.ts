import 'dotenv/config';
import { db } from '../src/prisma/db';

async function main() {
  console.log('Migrating channel table in Postgres...');
  await db.$executeRawUnsafe(`
    ALTER TABLE public."channel" ADD COLUMN IF NOT EXISTS "localPath" TEXT;
    ALTER TABLE public."channel" ADD COLUMN IF NOT EXISTS "niche" TEXT;
  `);
  console.log('✅ Columns "localPath" and "niche" added to public.channel successfully!');
}

main()
  .catch(err => {
    console.error('Error migrating channel table:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
