-- Crear tabla tokenUsage de forma segura
CREATE TABLE IF NOT EXISTS public."tokenUsage" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"           UUID NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
  "conversationId"   UUID REFERENCES public."conversation"("id") ON DELETE CASCADE,
  "provider"         TEXT NOT NULL,
  "modelName"        TEXT NOT NULL,
  "promptTokens"     INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas rápidas por usuario y mes
CREATE INDEX IF NOT EXISTS "idx_tokenUsage_userId" ON public."tokenUsage" ("userId");
CREATE INDEX IF NOT EXISTS "idx_tokenUsage_createdAt" ON public."tokenUsage" ("createdAt");
