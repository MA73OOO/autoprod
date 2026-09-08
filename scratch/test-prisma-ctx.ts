import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';

async function test() {
  const ch = await prisma.channel.findFirst({
    where: { name: { contains: 'Padre', mode: 'insensitive' } }
  });
  console.log('Channel ID:', ch?.id);
  const rows: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM public."channelContext" WHERE "channelId" = $1::uuid LIMIT 1`,
    ch?.id
  );
  console.log('Found row:', Boolean(rows[0]));
  if (rows[0]) {
    console.log('Title:', rows[0].title);
    console.log('Summary:', rows[0].contextSummary?.slice(0, 150));
    console.log('BestTags count:', rows[0].bestTags?.length);
    console.log('TopicsCovered count:', rows[0].topicsCovered?.length);
  }
}

test().finally(() => prisma.$disconnect());
