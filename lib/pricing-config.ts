// ─────────────────────────────────────────────────────────────────────────────
// AutoProd Pricing & Token Economics Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanConfig {
  id: string;
  name: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  displayName: string;
  priceUsd: number;
  tokenBudgetUsd: number; // Porción del precio destinada a consumo de IA
  maxChannels: number;
  maxVideosPerChannel: number;
  canRenderInCloud: boolean;
  hasAdvancedTemplates: boolean;
  whisperCloudMinutes: number;
  badge?: string;
  features: string[];
}

export const DEFAULT_PLATFORM_FEE_PERCENT = 10; // 10% de comisión AutoProd sobre tokens
export const CREDITS_PER_USD = 100; // 1 USD = 100 Créditos AutoProd (1 crédito = $0.01 USD)

export const PLANS_CONFIG: Record<'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE', PlanConfig> = {
  FREE: {
    id: 'free',
    name: 'FREE',
    displayName: 'Prueba Gratuita',
    priceUsd: 0,
    tokenBudgetUsd: 0.5, // 50 créditos de cortesía
    maxChannels: 1,
    maxVideosPerChannel: 5,
    canRenderInCloud: false,
    hasAdvancedTemplates: false,
    whisperCloudMinutes: 0,
    features: [
      '50 créditos iniciales de cortesía',
      '1 Canal de YouTube para pruebas',
      'AutoProd Brain™ (Copiloto de Prueba - 1 crédito/acción)',
      'Subtitulado Whisper Local básico',
      'Video Looper hasta 720p (10 min)',
      'Soporte por documentación',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'STARTER',
    displayName: 'Plan Starter',
    priceUsd: 70,
    tokenBudgetUsd: 20, // Con 10% de comisión: $18 netos = 1,800 créditos
    maxChannels: 1, // 1 Canal único profesional
    maxVideosPerChannel: 50,
    canRenderInCloud: true,
    hasAdvancedTemplates: false,
    whisperCloudMinutes: 60,
    badge: 'Ideal Creadores',
    features: [
      'AutoProd Brain™ (Cerebro Autónomo 24/7): 100% GRATIS e ILIMITADO',
      '1 Canal de YouTube Profesional (Totalmente automatizado)',
      'Bolsa mensual de 1,800 créditos de IA para modelos pesados y render',
      'Video Looper Studio hasta 1080p (1 hora)',
      'Whisper Local GPU/CPU + 60 min Cloud Whisper',
      'Exportación SRT / ASS compatible con CapCut',
      'Subida manual guiada a YouTube API v3',
      'Soporte estándar por correo',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    displayName: 'Plan Pro',
    priceUsd: 100,
    tokenBudgetUsd: 30, // Con 10% de comisión: $27 netos = 2,700 créditos
    maxChannels: 3, // Máximo 3 canales
    maxVideosPerChannel: 200,
    canRenderInCloud: true,
    hasAdvancedTemplates: true,
    whisperCloudMinutes: 180,
    badge: '🔥 MÁS POPULAR',
    features: [
      'AutoProd Brain™ (Cerebro Autónomo 24/7): 100% GRATIS e ILIMITADO',
      'Hasta 3 Canales de YouTube simultáneos (Multi-nicho)',
      'Bolsa mensual de 2,700 créditos de IA para modelos pesados y render',
      'Video Looper Studio 4K (3 horas) + Batch Looper',
      'Modo Carpeta Canciones (Whisper Masivo Local/Cloud)',
      'Exportación con estilos para Premiere, DaVinci y CapCut',
      'Memoria Vectorial Semántica de canal activa',
      'Subida y programación automática con YouTube API v3',
      'Soporte prioritario vía WhatsApp / Discord',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'ENTERPRISE',
    displayName: 'Plan Enterprise',
    priceUsd: 150,
    tokenBudgetUsd: 50, // Con 10% de comisión: $45 netos = 4,500 créditos
    maxChannels: 9999, // Canales ilimitados
    maxVideosPerChannel: 9999,
    canRenderInCloud: true,
    hasAdvancedTemplates: true,
    whisperCloudMinutes: 500,
    badge: '👑 MÁXIMA POTENCIA',
    features: [
      'AutoProd Brain™ (Cerebro Autónomo 24/7): 100% GRATIS e ILIMITADO',
      'Canales de YouTube ILIMITADOS (Redes de automatización masiva)',
      'Bolsa mensual de 4,500 créditos de IA para modelos pesados y render',
      'Video Looper 4K 60fps sin compresión + Pre-render background',
      'Whisper Studio masivo ilimitado local + 500 min Cloud',
      'Swarm de agentes autónomos continuos + Prompts VIP',
      'Embeddings vectoriales ilimitados por canal',
      'Publicación y automatización masiva programada',
      'Soporte VIP 1 a 1 y Onboarding asistido',
    ],
  },
};

/**
 * Calcula la bolsa de créditos netos para un plan aplicando la comisión de plataforma.
 */
export function calculatePlanCredits(
  tokenBudgetUsd: number,
  feePercent: number = DEFAULT_PLATFORM_FEE_PERCENT,
  creditsPerUsd: number = CREDITS_PER_USD
) {
  const feeAmountUsd = Number((tokenBudgetUsd * (feePercent / 100)).toFixed(2));
  const netTokenUsd = Number((tokenBudgetUsd - feeAmountUsd).toFixed(2));
  const creditsToGrant = Math.round(netTokenUsd * creditsPerUsd);
  return { feeAmountUsd, netTokenUsd, creditsToGrant };
}

/**
 * Determina si el orquestador base es gratuito para este usuario según su plan.
 * Regla de negocio:
 * - Si el usuario es FREE: el orquestador NO es gratis, descuenta 1 crédito de sus 50 tokens de prueba.
 * - Si el usuario es de pago (STARTER, PRO, ENTERPRISE): el orquestador es 100% GRATIS (0 créditos).
 */
export function isOrchestratorFreeForUser(
  userPlanName: string | null | undefined,
  modelName: string | null | undefined
): boolean {
  const cleanModel = (modelName || '').toLowerCase().trim();
  const isBaseOrchestrator = !cleanModel || cleanModel === 'default' || cleanModel === 'gpt-4o-mini';
  
  if (!isBaseOrchestrator) {
    return false; // Modelos pesados (gpt-4o, claude, etc.) siempre cobran
  }

  // Para gpt-4o-mini:
  const plan = (userPlanName || 'FREE').toUpperCase();
  if (plan === 'FREE') {
    return false; // A los gratis sí se les cobra de sus 50 tokens
  }

  return true; // A los usuarios de pago no se les cobra
}

export const DEFAULT_SERVICE_PRICING = [
  {
    serviceType: 'CHAT',
    modelName: 'gpt-4o-mini',
    costPerUnit: 1, // Para usuarios FREE cuesta 1 crédito; para de pago se anula a 0
    unitType: 'PER_REQUEST',
    description: 'Orquestador Base (Gratuito para planes de pago, 1 crédito en Free Trial)',
  },
  {
    serviceType: 'CHAT',
    modelName: 'gemini-1.5-flash',
    costPerUnit: 1,
    unitType: 'PER_REQUEST',
    description: 'Google Gemini Flash para respuestas rápidas',
  },
  {
    serviceType: 'CHAT',
    modelName: 'gpt-4o',
    costPerUnit: 3,
    unitType: 'PER_REQUEST',
    description: 'ChatGPT 4o Razonamiento y Redacción Avanzada',
  },
  {
    serviceType: 'CHAT',
    modelName: 'claude-3-5-sonnet',
    costPerUnit: 4,
    unitType: 'PER_REQUEST',
    description: 'Anthropic Claude 3.5 Sonnet Nivel Maestro',
  },
  {
    serviceType: 'CHAT',
    modelName: 'gemini-1.5-pro',
    costPerUnit: 3,
    unitType: 'PER_REQUEST',
    description: 'Google Gemini Pro con Pensamiento Profundo',
  },
  {
    serviceType: 'TOOL',
    modelName: 'whisper-1',
    costPerUnit: 1,
    unitType: 'PER_MINUTE',
    description: 'Transcripción Whisper en la Nube (1 crédito por minuto de audio)',
  },
  {
    serviceType: 'TOOL',
    modelName: 'dall-e-3',
    costPerUnit: 5,
    unitType: 'PER_REQUEST',
    description: 'Generación de Miniatura / Arte con DALL-E 3',
  },
];
