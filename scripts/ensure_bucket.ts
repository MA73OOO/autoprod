import 'dotenv/config';
import { db } from '../src/prisma/db';

async function main() {
  try {
    await db.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('assets', 'assets', true) 
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Bucket "assets" ready in Supabase Storage!');
  } catch (e: any) {
    console.warn('Could not insert directly into storage.buckets (might need service role or already managed):', e.message);
  }
}

main().finally(() => db.$disconnect());
