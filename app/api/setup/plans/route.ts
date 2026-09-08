import { NextResponse } from 'next/server';
import { db as prisma } from '@/src/prisma/db';
import { PLANS_CONFIG, DEFAULT_SERVICE_PRICING } from '@/lib/pricing-config';

export async function GET() {
  try {
    for (const [, planData] of Object.entries(PLANS_CONFIG)) {
      const existingPlan = await prisma.plan.findUnique({
        where: { name: planData.name },
        include: { limits: true }
      });

      if (!existingPlan) {
        await prisma.plan.create({
          data: {
            name: planData.name,
            limits: {
              create: {
                maxChannels: planData.maxChannels,
                maxVideosPerChannel: planData.maxVideosPerChannel,
                canRenderInCloud: planData.canRenderInCloud,
                hasAdvancedTemplates: planData.hasAdvancedTemplates,
                maxMonthlyRenderMinutes: planData.whisperCloudMinutes,
              }
            }
          }
        });
      } else {
        await prisma.planLimit.upsert({
          where: { planId: existingPlan.id },
          update: {
            maxChannels: planData.maxChannels,
            maxVideosPerChannel: planData.maxVideosPerChannel,
            canRenderInCloud: planData.canRenderInCloud,
            hasAdvancedTemplates: planData.hasAdvancedTemplates,
            maxMonthlyRenderMinutes: planData.whisperCloudMinutes,
          },
          create: {
            planId: existingPlan.id,
            maxChannels: planData.maxChannels,
            maxVideosPerChannel: planData.maxVideosPerChannel,
            canRenderInCloud: planData.canRenderInCloud,
            hasAdvancedTemplates: planData.hasAdvancedTemplates,
            maxMonthlyRenderMinutes: planData.whisperCloudMinutes,
          }
        });
      }
    }

    for (const pricing of DEFAULT_SERVICE_PRICING) {
      await prisma.servicePricing.upsert({
        where: {
          serviceType_modelName: {
            serviceType: pricing.serviceType,
            modelName: pricing.modelName,
          }
        },
        update: {
          costPerUnit: pricing.costPerUnit,
          unitType: pricing.unitType,
          isActive: true,
        },
        create: {
          serviceType: pricing.serviceType,
          modelName: pricing.modelName,
          costPerUnit: pricing.costPerUnit,
          unitType: pricing.unitType,
          isActive: true,
        }
      });
    }

    const plans = await prisma.plan.findMany({
      include: { limits: true }
    });

    return NextResponse.json({
      success: true,
      initialized: plans.length > 0,
      plans
    });
  } catch (error: any) {
    console.error('Error in setup plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
