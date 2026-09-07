import 'dotenv/config';
import { db } from '../src/prisma/db';

async function main() {
  console.log('Creating asset table in public schema...');
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public."asset" (
      "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId"      UUID NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
      "channelId"   UUID REFERENCES public."channel"("id") ON DELETE SET NULL,
      "name"        TEXT NOT NULL,
      "type"        TEXT NOT NULL,
      "format"      TEXT NOT NULL,
      "prompt"      TEXT,
      "storageUrl"  TEXT,
      "localPath"   TEXT,
      "sizeBytes"   BIGINT NOT NULL DEFAULT 0,
      "metadata"    JSONB DEFAULT '{}'::jsonb,
      "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
      "updatedAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "asset_userId_idx" ON public."asset" ("userId");
    CREATE INDEX IF NOT EXISTS "asset_channelId_idx" ON public."asset" ("channelId");
    CREATE INDEX IF NOT EXISTS "asset_type_idx" ON public."asset" ("type");
  `);

  console.log('✅ Table public."asset" created or verified.');

  const count = await db.asset.count();
  console.log('Current asset count via Prisma client:', count);
}

main()
  .catch(err => {
    console.error('Error creating asset table:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
