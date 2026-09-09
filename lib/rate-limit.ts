import { getClientIp, getSecureIpHash } from './anti-abuse';

interface RateLimitRecord {
  count: number;
  resetAt: number; // Timestamp en ms
}

// Almacén en memoria RAM para control de ráfaga y cuotas
const burstLimitStore = new Map<string, RateLimitRecord>();
const dailyQuotaStore = new Map<string, RateLimitRecord>();

// Configuración de límites por defecto
export const RATE_LIMIT_CONFIG = {
  BURST_WINDOW_MS: 60 * 1000, // 1 minuto
  BURST_MAX_REQUESTS: 15, // Máximo 15 mensajes por minuto
  DAILY_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 horas
  DAILY_FREE_MAX_REQUESTS: 150, // Máximo 150 mensajes diarios para usuarios FREE
};

// Limpieza periódica de registros expirados cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of burstLimitStore.entries()) {
      if (now > record.resetAt) burstLimitStore.delete(key);
    }
    for (const [key, record] of dailyQuotaStore.entries()) {
      if (now > record.resetAt) dailyQuotaStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  reason?: 'BURST_LIMIT_EXCEEDED' | 'DAILY_QUOTA_EXCEEDED';
  errorMessage?: string;
}

/**
 * Valida el límite de solicitudes por minuto (ráfaga) y diario (cuota de cortesía) para el orquestador de chat.
 */
export function checkChatRateLimit(
  req: Request,
  userId?: string | null,
  isFreeTier: boolean = false
): RateLimitResult {
  const clientIp = getClientIp(req);
  const identifier = userId ? `user:${userId}` : `ip:${getSecureIpHash(clientIp)}`;
  const now = Date.now();

  // 1. Validar Límite de Ráfaga por Minuto (Burst Limit)
  const burstKey = `burst:${identifier}`;
  const burstRecord = burstLimitStore.get(burstKey);

  if (burstRecord && now < burstRecord.resetAt) {
    if (burstRecord.count >= RATE_LIMIT_CONFIG.BURST_MAX_REQUESTS) {
      const resetInSeconds = Math.max(1, Math.ceil((burstRecord.resetAt - now) / 1000));
      return {
        allowed: false,
        limit: RATE_LIMIT_CONFIG.BURST_MAX_REQUESTS,
        remaining: 0,
        resetInSeconds,
        reason: 'BURST_LIMIT_EXCEEDED',
        errorMessage: `Has alcanzado el límite de ${RATE_LIMIT_CONFIG.BURST_MAX_REQUESTS} solicitudes por minuto. Por favor espera ${resetInSeconds} segundos antes de enviar otro mensaje.`
      };
    }
    burstRecord.count += 1;
  } else {
    burstLimitStore.set(burstKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.BURST_WINDOW_MS
    });
  }

  const currentBurst = burstLimitStore.get(burstKey)!;
  const burstRemaining = Math.max(0, RATE_LIMIT_CONFIG.BURST_MAX_REQUESTS - currentBurst.count);
  const burstResetSec = Math.max(1, Math.ceil((currentBurst.resetAt - now) / 1000));

  // 2. Validar Cuota Diaria para Cuentas Gratuitas (Free Tier Daily Cap)
  if (isFreeTier) {
    const dailyKey = `daily:${identifier}`;
    const dailyRecord = dailyQuotaStore.get(dailyKey);

    if (dailyRecord && now < dailyRecord.resetAt) {
      if (dailyRecord.count >= RATE_LIMIT_CONFIG.DAILY_FREE_MAX_REQUESTS) {
        const resetInSeconds = Math.max(1, Math.ceil((dailyRecord.resetAt - now) / 1000));
        const resetInHours = (resetInSeconds / 3600).toFixed(1);
        return {
          allowed: false,
          limit: RATE_LIMIT_CONFIG.DAILY_FREE_MAX_REQUESTS,
          remaining: 0,
          resetInSeconds,
          reason: 'DAILY_QUOTA_EXCEEDED',
          errorMessage: `Has completado tu cuota de prueba de ${RATE_LIMIT_CONFIG.DAILY_FREE_MAX_REQUESTS} mensajes diarios. Tu cuota se renovará en ${resetInHours} horas, o puedes adquirir un plan Starter/Pro para acceso ilimitado.`
        };
      }
      dailyRecord.count += 1;
    } else {
      dailyQuotaStore.set(dailyKey, {
        count: 1,
        resetAt: now + RATE_LIMIT_CONFIG.DAILY_WINDOW_MS
      });
    }
  }

  return {
    allowed: true,
    limit: RATE_LIMIT_CONFIG.BURST_MAX_REQUESTS,
    remaining: burstRemaining,
    resetInSeconds: burstResetSec
  };
}

/**
 * Agrega cabeceras estándar de Rate Limit a una respuesta HTTP.
 */
export function attachRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): Headers {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetInSeconds.toString());
  if (!result.allowed) {
    headers.set('Retry-After', result.resetInSeconds.toString());
  }
  return headers;
}
