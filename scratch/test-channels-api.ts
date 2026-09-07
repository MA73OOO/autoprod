import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { db } from '../src/prisma/db';
import { PLANS_CONFIG } from '../lib/pricing-config';

async function main() {
  console.log('--- Testing Channel Governance in DB ---');
  
  // 1. Get first user
  const user = await db.user.findFirst({
    include: {
      subscription: {
        include: {
          plan: {
            include: { limits: true }
          }
        }
      },
      channels: {
        include: { context: true }
      }
    }
  });

  if (!user) {
    console.log('No user found');
    return;
  }

  const userPlan = (user.subscription?.plan?.name as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') || 'FREE';
  const planConfig = PLANS_CONFIG[userPlan] || PLANS_CONFIG.FREE;
  const maxChannels = user.role === 'ADMIN' ? 9999 : (user.subscription?.plan?.limits?.maxChannels ?? planConfig.maxChannels);

  console.log(`User: ${user.email} (Role: ${user.role})`);
  console.log(`Plan: ${userPlan} | Max channels: ${maxChannels}`);
  console.log(`Current channels in DB: ${user.channels.length}`);
  
  user.channels.forEach(ch => {
    console.log(`  - [${ch.id}] "${ch.name}" | localPath: "${ch.localPath}" | niche: "${ch.niche}" | hasContext: ${!!ch.context}`);
  });

  console.log('Channel test complete.');
}

main().catch(console.error).finally(() => process.exit(0));
