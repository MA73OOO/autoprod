-- Habilitar la extensión pgvector en Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla channelContext para almacenar el contexto semántico y analítico de los canales
CREATE TABLE IF NOT EXISTS public."channelContext" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "channelId"       UUID NOT NULL UNIQUE REFERENCES public."channel"("id") ON DELETE CASCADE,
  "userId"          UUID NOT NULL REFERENCES public."user"("id") ON DELETE CASCADE,
  "channelUrl"      TEXT NOT NULL,
  "handle"          TEXT,
  "title"           TEXT NOT NULL,
  "description"     TEXT,
  "subscriberCount" INTEGER,
  "videoCount"      INTEGER,
  "viewCount"       BIGINT,
  "contextSummary"  TEXT NOT NULL,
  "topicsCovered"   JSONB DEFAULT '[]'::jsonb,
  "bestTags"        JSONB DEFAULT '[]'::jsonb,
  "embedding"       vector(1536),
  "createdAt"       TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

-- Índices de consulta
CREATE INDEX IF NOT EXISTS "idx_channelContext_userId" ON public."channelContext" ("userId");
CREATE INDEX IF NOT EXISTS "idx_channelContext_channelId" ON public."channelContext" ("channelId");

-- Índice HNSW para búsqueda rápida por similitud de coseno
CREATE INDEX IF NOT EXISTS "idx_channelContext_embedding_hnsw" 
ON public."channelContext" 
USING hnsw ("embedding" vector_cosine_ops);

-- Función RPC para búsqueda semántica de canales por similitud de coseno
CREATE OR REPLACE FUNCTION match_channel_contexts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  channel_id uuid,
  title text,
  handle text,
  context_summary text,
  topics_covered jsonb,
  best_tags jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cc."id",
    cc."channelId" AS channel_id,
    cc."title",
    cc."handle",
    cc."contextSummary" AS context_summary,
    cc."topicsCovered" AS topics_covered,
    cc."bestTags" AS best_tags,
    1 - (cc."embedding" <=> query_embedding) AS similarity
  FROM public."channelContext" cc
  WHERE cc."userId" = p_user_id
    AND cc."embedding" IS NOT NULL
    AND 1 - (cc."embedding" <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
