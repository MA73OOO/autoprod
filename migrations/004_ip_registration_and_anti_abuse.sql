-- ==============================================================================
-- AutoProd: Migración 004 - Tabla de Registro de IPs y Control Anti-Multicuentas
-- ==============================================================================

-- 1. Crear tabla para el seguimiento de hashes de IP y límites de bonos de cortesía
CREATE TABLE IF NOT EXISTS public.ip_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT UNIQUE NOT NULL,
    account_count INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Índice para consultas O(1) de verificación de multicuentas
CREATE INDEX IF NOT EXISTS idx_ip_registration_hash ON public.ip_registration(ip_hash);

-- 3. Comentarios explicativos de auditoría
COMMENT ON TABLE public.ip_registration IS 'Almacén de hashes HMAC-SHA256 de IPs para prevenir granjas y creación masiva de cuentas de prueba.';
COMMENT ON COLUMN public.ip_registration.ip_hash IS 'Hash HMAC-SHA256 irreversible de la IP del cliente (cumplimiento GDPR).';
COMMENT ON COLUMN public.ip_registration.account_count IS 'Número de cuentas de prueba que han reclamado bonos desde esta red.';
