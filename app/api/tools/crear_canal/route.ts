import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { getWorkspacePath } from '@/harness/setup/detector';
import { PLANS_CONFIG } from '@/lib/pricing-config';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

function sanitizeFolderName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, ' - ').replace(/\s+/g, ' ').trim() || 'Nuevo_Canal';
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      nombre_canal,
      nombre,
      channel_name,
      name,
      tematica,
      niche,
      nicho,
      tema,
      contexto_del_usuario,
      description,
      estilo_tono,
      estilo,
      tono,
      style,
      audiencia,
      publico_objetivo,
      audience,
      _userContext
    } = body;

    const rawName = (nombre_canal || nombre || channel_name || name || '').trim();
    if (!rawName) {
      return NextResponse.json({ error: 'El nombre del canal es obligatorio.' }, { status: 400 });
    }

    const cleanChannelName = sanitizeFolderName(rawName);
    const channelNiche = (tematica || niche || nicho || tema || contexto_del_usuario || description || cleanChannelName).trim();
    const channelTone = (estilo_tono || estilo || tono || style || 'Cercano, profesional y enfocado en aportar valor al creador').trim();
    const channelAudience = (audiencia || publico_objetivo || audience || 'Público interesado en la temática del canal').trim();

    const userId = _userContext?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado. Falta contexto de usuario (_userContext).' }, { status: 401 });
    }

    // ──────────────────────────────────────────────
    // 1. Validar Límites de Suscripción del Usuario
    // ──────────────────────────────────────────────
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: {
              include: { limits: true }
            }
          }
        }
      }
    });

    const userPlan = (dbUser?.subscription?.plan?.name as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') || 'FREE';
    const planConfig = PLANS_CONFIG[userPlan] || PLANS_CONFIG.FREE;
    const maxChannels = dbUser?.role === 'ADMIN' ? 9999 : (dbUser?.subscription?.plan?.limits?.maxChannels ?? planConfig.maxChannels);

    // Comprobar si el canal ya existe para este usuario (por nombre insensible a mayúsculas)
    const existingChannel = await db.channel.findFirst({
      where: {
        userId,
        name: { equals: cleanChannelName, mode: 'insensitive' }
      }
    });

    const currentChannelsCount = await db.channel.count({
      where: { userId }
    });

    if (!existingChannel && currentChannelsCount >= maxChannels) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        code: 'MAX_CHANNELS_REACHED',
        currentCount: currentChannelsCount,
        maxAllowed: maxChannels,
        userPlan,
        message: `Has alcanzado el límite máximo de ${maxChannels} canal(es) de tu plan actual (${planConfig.displayName}). Actualiza a Pro o Enterprise para gestionar más canales simultáneos.`
      }, { status: 403 });
    }

    // ──────────────────────────────────────────────
    // 2. Resolver Ruta Física en Workspace
    // ──────────────────────────────────────────────
    const workspaceRoot = _userContext?.workspacePath || getWorkspacePath();
    if (!workspaceRoot) {
      throw new Error('No hay ruta de workspace configurada en el sistema.');
    }

    const channelLocalPath = path.join(workspaceRoot, cleanChannelName).replace(/\\/g, '/');
    const infoCanalFolderPath = path.join(workspaceRoot, cleanChannelName, 'InfoCanal');

    // ──────────────────────────────────────────────
    // 3. Registrar o Actualizar en Base de Datos (Prisma & Supabase)
    // ──────────────────────────────────────────────
    let channelRecord;
    if (existingChannel) {
      channelRecord = await db.channel.update({
        where: { id: existingChannel.id },
        data: {
          localPath: channelLocalPath,
          niche: channelNiche,
        }
      });
    } else {
      channelRecord = await db.channel.create({
        data: {
          userId,
          name: cleanChannelName,
          localPath: channelLocalPath,
          niche: channelNiche,
        }
      });
    }

    const supabase = getSupabaseClient();
    try {
      await supabase.from('channelContext').upsert({
        channelId: channelRecord.id,
        userId,
        channelUrl: `local://${encodeURIComponent(cleanChannelName)}`,
        title: cleanChannelName,
        description: `Canal enfocado en: ${channelNiche}. Tono: ${channelTone}. Audiencia: ${channelAudience}.`,
        contextSummary: `Canal temático: "${cleanChannelName}". Nicho: ${channelNiche}. Audiencia: ${channelAudience}. Estilo: ${channelTone}.`,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'channelId' });
    } catch (ctxErr) {
      console.warn('[CrearCanal] Advertencia al actualizar channelContext:', ctxErr);
    }

    // ──────────────────────────────────────────────
    // 4. Crear Físicamente la Estructura en Disco
    // ──────────────────────────────────────────────
    await fs.mkdir(infoCanalFolderPath, { recursive: true });

    // 5. Generar los 4 Archivos de Memoria Canónica en InfoCanal/
    const contextoContent = `# 🧠 Contexto y ADN del Canal — ${cleanChannelName}

## 📌 Visión y Propuesta de Valor
- **Canal:** ${cleanChannelName}
- **Nicho Principal:** ${channelNiche}
- **Público Objetivo:** ${channelAudience}
- **Tono y Estilo:** ${channelTone}

---

## 🎯 Pilares Editoriales y Enfoque de Contenido
1. **Intención:** Crear contenido estructurado que aporte valor genuino a la audiencia.
2. **Identidad:** Respetar la voz y el estilo definidos sin recurrir a clichés ni marketing agresivo.
3. **Calidad:** Cuidar la coherencia temática en cada video para construir autoridad y audiencia recurrente.

---

## 🧭 Directivas de Producción para el Orquestador
- Consultar siempre este documento antes de planificar un nuevo video.
- Mantener las propuestas de títulos y guiones 100% alineadas con la audiencia: *${channelAudience}*.
- Utilizar las 5 subcarpetas estándar en cada video: \`Guiones/\`, \`Videos/\`, \`Miniatura/\`, \`Musica/\`, \`Ambiente/\`.
`;

    const metricasContent = `# 📊 Métricas y Pilares Temáticos — ${cleanChannelName}

## 🏷️ Palabras Clave y Etiquetas Principales de Nicho
- ${channelNiche}
- ${cleanChannelName.toLowerCase()}
- tutoriales
- contenido de valor

---

## 📈 Objetivos de Rendimiento
- **Retención Promedio:** Superar el 50% de retención en los primeros 30 segundos.
- **Frecuencia:** Publicación constante y predecible.
- **Diferenciación:** Tratar temas con ángulos originales evitando repetir fórmulas agotadas.

*(Este archivo se actualizará automáticamente a medida que produzcas y analices nuevos videos en AutoProd).*
`;

    const historialContent = `# 📜 Historial de Producción — ${cleanChannelName}

> **Registro de temas ya cubiertos:** Este documento sirve como memoria histórica para que el Orquestador y el creador **NUNCA** repitan un tema, título o ángulo ya producido.

| # | Título del Video | Fecha de Planificación | Estado |
|---|---|---|---|
| — | *(Aún no hay videos registrados. Planifica tu primer video con el orquestador)* | — | — |
`;

    const brandingContent = `# 🎨 Guía de Branding y Recursos Visuales — ${cleanChannelName}

Directivas estéticas para los elementos gráficos del canal (archivos a ubicar en \`InfoCanal/\`):

1. **\`logo.jpg\` (Avatar de Perfil):**
   - **Formato:** 1:1 Cuadrado (800 x 800 px).
   - **Diseño sugerido:** Icono distintivo o símbolo memorable que represente el nicho: *${channelNiche}*.
   - **Paleta recomendada:** Colores contrastantes y limpios, legibles en formato circular móvil.

2. **\`banner.jpg\` (Encabezado de YouTube):**
   - **Formato:** 16:9 Panorámico (2560 x 1440 px).
   - **Diseño sugerido:** Composición horizontal con área segura central de 1546 x 423 px.
   - **Contenido:** Nombre del canal, propuesta de valor clara y estilo visual: *${channelTone}*.

3. **\`marca_de_agua.jpg\` (Botón de Suscripción):**
   - **Formato:** 1:1 Cuadrado (150 x 150 px).
   - **Diseño:** Botón gráfico limpio para la esquina inferior derecha de cada render audiovisual.
`;

    const pathContexto = path.join(infoCanalFolderPath, 'Contexto_canal.md');
    const pathMetricas = path.join(infoCanalFolderPath, 'Metricas_canal.md');
    const pathHistorial = path.join(infoCanalFolderPath, 'Historial_canal.md');
    const pathBranding = path.join(infoCanalFolderPath, 'Branding_canal.md');

    await fs.writeFile(pathContexto, contextoContent, 'utf-8');
    await fs.writeFile(pathMetricas, metricasContent, 'utf-8');
    await fs.writeFile(pathHistorial, historialContent, 'utf-8');
    await fs.writeFile(pathBranding, brandingContent, 'utf-8');

    return NextResponse.json({
      status: 'success',
      channel: {
        id: channelRecord.id,
        name: channelRecord.name,
        localPath: channelLocalPath,
        niche: channelRecord.niche,
      },
      infoCanalPath: infoCanalFolderPath,
      filesCreated: ['Contexto_canal.md', 'Metricas_canal.md', 'Historial_canal.md', 'Branding_canal.md'],
      message: `Canal "${cleanChannelName}" creado e inicializado exitosamente en ${channelLocalPath} con su carpeta InfoCanal/ y sus 4 archivos de memoria y ADN.`
    });

  } catch (error: any) {
    console.error('[Error crear_canal]:', error);
    return NextResponse.json({ error: error.message || 'Error interno al crear el canal' }, { status: 500 });
  }
}
