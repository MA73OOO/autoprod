import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';

async function test() {
  const ch = await prisma.channel.findFirst({
    where: { name: { contains: 'Padre', mode: 'insensitive' } }
  });
  console.log('Channel:', ch?.id, ch?.name);
  if (!ch) return;

  const ctx: any = await prisma.$queryRawUnsafe(`SELECT id, "channelId", title, "bestTags", "topicsCovered", "contextSummary" FROM public."channelContext" WHERE "channelId" = $1::uuid`, ch.id);
  console.log('Context rows:', ctx.length);
  if (ctx.length > 0) {
    console.log('bestTags type:', typeof ctx[0].bestTags, Array.isArray(ctx[0].bestTags));
    console.log('bestTags sample:', JSON.stringify(ctx[0].bestTags).slice(0, 300));
    console.log('topicsCovered sample:', JSON.stringify(ctx[0].topicsCovered).slice(0, 300));
  }
}

test().finally(() => prisma.$disconnect());
