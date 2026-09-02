import 'dotenv/config';
import { db } from './src/prisma/db';

async function main() {
  try {
    console.log('Connected to DB via Prisma!');
    
    await db.$executeRawUnsafe('GRANT SELECT ON public.user_api_keys TO service_role;');
    await db.$executeRawUnsafe('GRANT INSERT, UPDATE, DELETE ON public.user_api_keys TO service_role;');
    console.log('Permissions granted to service_role!');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.$disconnect();
  }
}

main();
