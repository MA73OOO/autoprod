-- Crear tabla Agent
CREATE TABLE IF NOT EXISTS "public"."agent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- Crear tabla AgentStep
CREATE TABLE IF NOT EXISTS "public"."agentStep" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "dynamicPromptTemplate" TEXT,
    CONSTRAINT "agentStep_pkey" PRIMARY KEY ("id")
);

-- Crear tabla AgentTool
CREATE TABLE IF NOT EXISTS "public"."agentTool" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    CONSTRAINT "agentTool_pkey" PRIMARY KEY ("id")
);

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "agent_slug_key" ON "public"."agent"("slug");

-- Agregar llaves foráneas (Relaciones)
-- Primero borramos si ya existen para evitar errores, pero si IF NOT EXISTS estuviera soportado para constraints, lo usaríamos.
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agentStep_agentId_fkey') THEN 
    ALTER TABLE "public"."agentStep" ADD CONSTRAINT "agentStep_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agentTool_stepId_fkey') THEN 
    ALTER TABLE "public"."agentTool" ADD CONSTRAINT "agentTool_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."agentStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
