import crypto from 'crypto';

// Lista de dominios de correos temporales / desechables comunes
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'tempmail.com',
  'temp-mail.org',
  'tempmail.net',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'mailinator.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'mytemp.email',
  'throwawaymail.com',
  'burnermail.io',
  'mohmal.com',
  'crazymailing.com',
  'generator.email',
  'emailondeck.com',
  'inboxkitten.com'
]);

/**
 * Extrae la dirección IP del cliente de forma segura considerando proxies y CDNs.
 */
export function getClientIp(reqOrHeaders: Request | Headers): string {
  const headers = reqOrHeaders instanceof Request ? reqOrHeaders.headers : reqOrHeaders;
  
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    return ips[0].trim();
  }

  return '127.0.0.1';
}

/**
 * Genera un HMAC-SHA256 irreversible de la IP del cliente utilizando una sal secreta.
 * Garantiza privacidad absoluta (cumplimiento GDPR) y velocidad de búsqueda O(1).
 */
export function getSecureIpHash(ip: string): string {
  const secret = process.env.IP_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'autoprod-salt-key-2026';
  return crypto
    .createHmac('sha256', secret)
    .update(ip.trim())
    .digest('hex');
}

/**
 * Normaliza una dirección de correo electrónico eliminando sufijos de alias tipo `usuario+alias@gmail.com`.
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  const cleanEmail = email.toLowerCase().trim();
  const [localPart, domain] = cleanEmail.split('@');
  if (!localPart || !domain) return cleanEmail;

  // Si es un proveedor que soporta alias con '+', removemos la parte posterior al '+'
  const baseLocal = localPart.split('+')[0];
  return `${baseLocal}@${domain}`;
}

/**
 * Comprueba si un correo pertenece a un proveedor de emails temporales / desechables.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().trim().split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Cantidad máxima de cuentas de prueba que pueden recibir los 50 créditos de bienvenida
 * desde una misma IP o subred.
 */
export const MAX_FREE_ACCOUNTS_PER_IP = 2;

/**
 * Evalúa si una cuenta nueva es elegible para recibir los 50 créditos de cortesía.
 * Criterios:
 * 1. No debe ser correo desechable.
 * 2. La IP (mediante su hash) no debe haber registrado más de MAX_FREE_ACCOUNTS_PER_IP cuentas de prueba.
 */
export async function evaluateWelcomeBonusEligibility(
  email: string,
  clientIp: string,
  dbClient: any
): Promise<{ eligible: boolean; reason?: string; ipHash: string }> {
  const ipHash = getSecureIpHash(clientIp);

  // 1. Validar correo desechable
  if (isDisposableEmail(email)) {
    return {
      eligible: false,
      reason: 'DISPOSABLE_EMAIL',
      ipHash
    };
  }

  // 2. Validar multicuentas por IP Hash en la base de datos
  try {
    const existingRegistration = await dbClient.ipRegistration.findUnique({
      where: { ipHash }
    });

    if (existingRegistration && existingRegistration.accountCount >= MAX_FREE_ACCOUNTS_PER_IP) {
      return {
        eligible: false,
        reason: 'MAX_ACCOUNTS_PER_IP_EXCEEDED',
        ipHash
      };
    }

    return {
      eligible: true,
      ipHash
    };
  } catch (error) {
    console.warn('Error al verificar IP Registration en DB, permitiendo por defecto:', error);
    return {
      eligible: true,
      ipHash
    };
  }
}

/**
 * Registra o incrementa el contador de cuentas asociadas al IP Hash tras otorgar el bono.
 */
export async function recordIpBonusGranted(ipHash: string, dbClient: any): Promise<void> {
  try {
    await dbClient.ipRegistration.upsert({
      where: { ipHash },
      update: {
        accountCount: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        ipHash,
        accountCount: 1
      }
    });
  } catch (error) {
    console.warn('Error al registrar IP Registration en DB:', error);
  }
}
