import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';
import { PLANS_CONFIG, DEFAULT_SERVICE_PRICING } from '../lib/pricing-config';

async function seedPlansAndPricing() {
  console.log('🌱 Inicializando Planes y Límites de AutoProd...');

  for (const [key, planData] of Object.entries(PLANS_CONFIG)) {
    const existingPlan = await prisma.plan.findUnique({
      where: { name: planData.name },
      include: { limits: true }
    });

    if (!existingPlan) {
      const createdPlan = await prisma.plan.create({
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
      console.log(`✅ Plan creado: ${createdPlan.name}`);
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
      console.log(`🔄 Plan actualizado: ${existingPlan.name}`);
    }
  }

  console.log('🌱 Inicializando Tarifas Dinámicas de Servicio (ServicePricing)...');
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
    console.log(`✅ Tarifa configurada: [${pricing.serviceType}] ${pricing.modelName} -> ${pricing.costPerUnit} créditos`);
  }

  console.log('✨ ¡Planes y Tarifas inicializados exitosamente!');
}

seedPlansAndPricing()
  .catch((e) => {
    console.error('Error al inicializar planes y tarifas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
