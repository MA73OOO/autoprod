import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';
import path from 'path';
import fs from 'fs';
import { getWorkspacePath } from '../harness/setup/detector';

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

async function matchChannel(userQuery: string, userId: string, workspacePath: string) {
  const normQuery = normalize(userQuery);
  const userChannels = await prisma.channel.findMany({ where: { userId } });

  console.log(`Matching query: "${userQuery}"`);
  console.log(`Normalized query: "${normQuery}"`);
  console.log(`User channels in DB:`, userChannels.map(c => c.name));

  // 1. Full substring match
  for (const ch of userChannels) {
    if (normQuery.includes(normalize(ch.name))) {
      return ch;
    }
  }

  // 2. Keyword match
  const stopWords = new Set(['canal', 'para', 'el', 'la', 'los', 'las', 'de', 'del', 'un', 'una', 'en', 'con', 'video', 'videos', 'nuevo', 'crear', 'hacer', 'puedes', 'ayudarme', 'quiero']);
  for (const ch of userChannels) {
    const words = normalize(ch.name).split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    console.log(`Channel "${ch.name}" significant words:`, words);
    if (words.some(w => normQuery.includes(w))) {
      return ch;
    }
  }

  return null;
}

async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  const user = users[0];
  const ws = getWorkspacePath() || '';

  const matched = await matchChannel('Quiero hacer un video para el canal del padre, Puedes ayudarme?', user.id, ws);
  console.log('\nRESULT MATCHED CHANNEL:', matched?.name);
}

main().finally(() => prisma.$disconnect());
