import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';

async function main() {
  const p = await prisma.promptTemplate.findUnique({ where: { name: 'crear_canal' } });
  console.log('--- SYSTEM PROMPT (crear_canal) ---');
  console.log(p?.systemPrompt);
  console.log('--- WELCOME TEXT (crear_canal) ---');
  console.log(p?.welcomeText);
}

main().finally(() => prisma.$disconnect());
