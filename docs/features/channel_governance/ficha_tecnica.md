# 🏛️ FEAT-12 — Gobernanza de Canales: Control de Límites + Nicho Guardrail IA

## Ficha Técnica

### Propósito
Sistema de control y gobierno de canales que garantiza:
1. Cada canal registrado en BD tiene su `localPath` (ruta física en disco) y `niche` (nicho temático).
2. La creación de canales está limitada por el plan de suscripción (`maxChannels`).
3. La IA (orquestador) rechaza cordialmente solicitudes de contenido fuera del nicho del canal activo.
4. El chat muestra un **selector permanente de canal activo** con badge de nicho, ruta y estado del guardrail.

---

### Archivos Modificados

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Campos `localPath String?` y `niche String?` en model `Channel` |
| `src/prisma/contract.prisma` | Idem |
| `scripts/migrate_channel_paths.ts` | Script `ALTER TABLE channel ADD COLUMN IF NOT EXISTS "localPath"/"niche"` ejecutado |
| `app/api/channels/route.ts` | `GET` combina canales de Prisma con `channelContext` de Supabase (sin relación Prisma inválida); `POST` valida límite por plan y crea/actualiza canal con `localPath` y `niche` |
| `app/api/tools/extraer_canal_youtube/route.ts` | Guarda `localPath` y `niche` al importar canal YouTube |
| `app/api/chat/route.ts` | Resuelve `channelId` (UUID o nombre de carpeta), vincula contexto semántico de Supabase, e inyecta guardrail estricto de nicho y presentación ejecutiva personalizada para el canal activo |
| `app/api/conversations/[id]/route.ts` | `PATCH` resuelve `channelId` como UUID o nombre (lookup + autocreate) |
| `components/dashboard/ChatPanel.tsx` | Barra permanente de `Canal Activo:` con dropdown, badge de nicho, ruta y estado de guardrail |
| `components/dashboard/types.ts` | `Channel` interface + `localPath`, `niche`, `context` |
| `app/dashboard/page.tsx` | `channels` cargados desde `GET /api/channels` con UUIDs reales; `handleCreateChannel` llama `POST /api/channels` antes de crear carpetas locales; `channelId` enviado al chat |
| `lib/controlador-client.ts` | Alias `initVideoWorkspace()` delegando a `createFolder()` |

---

### Endpoints

#### `GET /api/channels`
- Auth: `getAuthUser()`
- Retorna: canales del usuario con `context` y `videos` incluidos
- Ordenado por `createdAt desc`

#### `POST /api/channels`
```json
{
  "name": "MiCanal",
  "localPath": "E:/autoprod/youtube/MiCanal",
  "niche": "Vaqueros y Rodeos",
  "description": "(opcional) Descripción inicial del nicho"
}
```
- Verifica `maxChannels` del plan antes de crear
- Si canal ya existe (por nombre), actualiza `localPath`/`niche`
- Si `niche`/`description` se pasan en canal nuevo, inicializa `ChannelContext` básico
- Error `403` con `code: "MAX_CHANNELS_REACHED"` si límite alcanzado

---

### Guardrail de Nicho (app/api/chat/route.ts)

Cuando el chat recibe `channelId`, busca el canal activo y su `context.contextSummary`.  
Inyecta en el `systemPrompt`:

```
=== GUARDRAIL ESTRICTO: CANAL ACTIVO Y DELIMITACIÓN DE NICHO ===
- CANAL ACTIVO: "MiCanal"
- NICHO: "Vaqueros y Rodeos"
- RUTA: "E:/autoprod/youtube/MiCanal"

REGLAS:
1. Todo contenido DEBE ser del nicho "Vaqueros y Rodeos"
2. Si pide tema ajeno → rechazar cordialmente e indicar que seleccione otro canal
3. Operaciones de archivos → dirigir a la ruta del canal
```

---

### Límites por Plan

| Plan | `maxChannels` |
|---|---|
| FREE | 1 |
| STARTER | 1 |
| PRO | 3 |
| ENTERPRISE | Ilimitado (9999) |
| ADMIN | Ilimitado |

---

### ChatPanel — Barra de Canal Activo

La barra superior del chat (visible siempre) muestra:
- **Dropdown** con todos los canales del usuario (UUIDs reales desde BD)
- **Badge de nicho:** `🎯 Nicho: Vaqueros`
- **Ruta física:** `📁 E:/autoprod/youtube/MiCanal`
- **Indicador de guardrail:** `🛡️ Guardrail Activo: IA restringida a este nicho`

---

### Script de Migración

```ts
// scripts/migrate_channel_paths.ts — ya ejecutado ✅
ALTER TABLE public."channel" ADD COLUMN IF NOT EXISTS "localPath" TEXT;
ALTER TABLE public."channel" ADD COLUMN IF NOT EXISTS "niche" TEXT;
```
