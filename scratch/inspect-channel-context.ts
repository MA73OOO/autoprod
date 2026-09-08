import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('=== CHANNELS IN DB ===');
  const channels = await prisma.channel.findMany({
    include: { videos: true }
  });
  console.log(JSON.stringify(channels, null, 2));

  console.log('\n=== CHANNEL CONTEXTS IN DB ===');
  const contexts = await prisma.$queryRawUnsafe(`SELECT id, "channelId", title, handle, "subscriberCount", "contextSummary", "bestTags" FROM public."channelContext"`);
  console.log(JSON.stringify(contexts, null, 2));

  console.log('\n=== ORCHESTRATOR TOOLS ===');
  const orch = await prisma.agent.findFirst({
    where: { slug: 'orchestrator' },
    include: { agentTools: { include: { tool: true } } }
  });
  console.log(orch?.agentTools.map(at => at.tool.name));
}

main().finally(() => prisma.$disconnect());
