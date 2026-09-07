import { ExtractedChannelData, YouTubeVideoItem } from './extractor';

export interface TagMetric {
  tag: string;
  count: number;
  totalViews: number;
  avgViews: number;
  engagementScore: number;
}

export interface ChannelAnalyticsResult {
  topTags: TagMetric[];
  bestVideos: YouTubeVideoItem[];
  averageViews: number;
  totalLikes: number;
  contextSummaryText: string;
  markdownContexto: string;
  markdownMetricas: string;
  markdownHistorial: string;
}

/**
 * Analiza las etiquetas (tags) de todos los videos, calculando su frecuencia y rendimiento promedio.
 */
export function analyzeTags(videos: YouTubeVideoItem[]): TagMetric[] {
  const tagMap = new Map<string, { count: number; totalViews: number; totalEng: number }>();

  for (const video of videos) {
    const views = video.viewCount || 0;
    const eng = (video.likeCount || 0) + (video.commentCount || 0);

    for (const rawTag of video.tags) {
      const tag = rawTag.trim().toLowerCase();
      if (!tag || tag.length < 2) continue;

      const existing = tagMap.get(tag) || { count: 0, totalViews: 0, totalEng: 0 };
      tagMap.set(tag, {
        count: existing.count + 1,
        totalViews: existing.totalViews + views,
        totalEng: existing.totalEng + eng,
      });
    }
  }

  const metrics: TagMetric[] = [];
  for (const [tag, data] of tagMap.entries()) {
    const avgViews = data.count > 0 ? Math.round(data.totalViews / data.count) : 0;
    const engagementScore = data.totalViews > 0 ? Number(((data.totalEng / data.totalViews) * 100).toFixed(2)) : 0;
    metrics.push({
      tag,
      count: data.count,
      totalViews: data.totalViews,
      avgViews,
      engagementScore,
    });
  }

  // Ordenar primero por vistas promedio y luego por frecuencia
  metrics.sort((a, b) => {
    if (b.count >= 2 && a.count >= 2) {
      return b.avgViews - a.avgViews;
    }
    return (b.avgViews * b.count) - (a.avgViews * a.count);
  });

  return metrics.slice(0, 35);
}

/**
 * Genera el análisis analítico completo, catálogo anti-duplicados y los 3 archivos Markdown.
 */
export function processChannelAnalytics(data: ExtractedChannelData): ChannelAnalyticsResult {
  const { channel, videos } = data;
  const topTags = analyzeTags(videos);

  // Métricas generales
  const totalViewsInSample = videos.reduce((acc, v) => acc + v.viewCount, 0);
  const totalLikes = videos.reduce((acc, v) => acc + v.likeCount, 0);
  const averageViews = videos.length > 0 ? Math.round(totalViewsInSample / videos.length) : 0;

  // Mejores videos por reproducciones
  const sortedByViews = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const bestVideos = sortedByViews.slice(0, 5);

  // Lista de temas y títulos para catálogo anti-duplicación
  const publishedTitles = videos.map(v => v.title);

  // ──────────────────────────────────────────────
  // 1. Resumen Sintético para el Vector Embedding
  // ──────────────────────────────────────────────
  const topTagsStr = topTags.slice(0, 15).map(t => t.tag).join(', ');
  const topTitlesStr = bestVideos.map(v => `"${v.title}" (${v.viewCount.toLocaleString()} vistas)`).join('; ');
  const recentTitlesStr = videos.slice(0, 15).map(v => `"${v.title}"`).join(', ');

  const contextSummaryText = `Canal de YouTube: "${channel.title}" (${channel.customUrl || `@${channel.title}`})
Descripción: ${channel.description.slice(0, 500)}
Métricas del canal: ${channel.subscriberCount.toLocaleString()} suscriptores, ${channel.videoCount} videos totales, ${channel.viewCount.toLocaleString()} vistas acumuladas.
Promedio de vistas recientes: ${averageViews.toLocaleString()} por video.
Etiquetas más exitosas y frecuentes: ${topTagsStr}.
Videos con mejor rendimiento histórico: ${topTitlesStr}.
Temas y títulos ya abordados (anti-duplicación): ${recentTitlesStr}.
Estilo y Nicho: Contenido enfocado en ${channel.title}, con audiencia interesada en ${topTagsStr}.`;

  // ──────────────────────────────────────────────
  // 2. Archivo 1: Contexto_canal.md
  // ──────────────────────────────────────────────
  const markdownContexto = `# 📺 Contexto y Guía de Identidad: ${channel.title}

> Documento generado automáticamente por **AutoProd YouTube Channel Extractor**.
> Sirve como la fuente de verdad de la marca, tono y audiencia del canal.

---

## 📌 Datos Generales del Canal
- **Nombre:** ${channel.title}
- **Handle / URL:** ${channel.customUrl ? `https://www.youtube.com/${channel.customUrl}` : `https://www.youtube.com/channel/${channel.id}`}
- **ID de YouTube:** \`${channel.id}\`
- **Suscriptores:** ${channel.subscriberCount.toLocaleString()}
- **Videos Totales:** ${channel.videoCount.toLocaleString()}
- **Vistas Totales Acumuladas:** ${channel.viewCount.toLocaleString()}
- **Fecha de Creación:** ${channel.publishedAt ? new Date(channel.publishedAt).toLocaleDateString('es-ES') : 'No disponible'}

---

## 📝 Descripción Oficial del Canal
${channel.description || '*El canal no tiene descripción configurada en YouTube.*'}

---

## 🎯 Perfil de Audiencia y Tono Detectado
- **Nicho Principal:** ${topTags.slice(0, 5).map(t => t.tag).join(' / ') || channel.title}
- **Enfoque de Contenido:** Producción enfocada en retención y engagement dentro de la temática de ${channel.title}.
- **Directiva de AutoProd:** Todos los nuevos guiones y videos creados en las subcarpetas hermanas deben mantener coherencia con esta identidad y respetar los temas ya cubiertos en \`Historial_canal.md\`.
`;

  // ──────────────────────────────────────────────
  // 3. Archivo 2: Metricas_canal.md
  // ──────────────────────────────────────────────
  const tagsTableRows = topTags.slice(0, 20).map((t, idx) => 
    `| ${idx + 1} | \`${t.tag}\` | ${t.count} | ${t.avgViews.toLocaleString()} | ${t.totalViews.toLocaleString()} | ${t.engagementScore}% |`
  ).join('\n');

  const bestVideosList = bestVideos.map((v, idx) => 
    `${idx + 1}. **[${v.title}](${v.url})**
   - 👁️ Vistas: **${v.viewCount.toLocaleString()}** | ❤️ Likes: **${v.likeCount.toLocaleString()}** | 💬 Comentarios: **${v.commentCount.toLocaleString()}**
   - 🏷️ Tags destacadas: ${v.tags.slice(0, 6).map(t => `\`${t}\``).join(', ') || 'Sin tags'}
   - 📅 Publicado: ${new Date(v.publishedAt).toLocaleDateString('es-ES')}`
  ).join('\n\n');

  const markdownMetricas = `# 📊 Métricas de Rendimiento y Etiquetas: ${channel.title}

> Análisis estadístico basado en los últimos **${videos.length} videos** extraídos del canal.
> Utiliza esta data para seleccionar etiquetas comprobadas y replicar fórmulas de títulos ganadoras.

---

## 📈 Resumen de Rendimiento
- **Muestra analizada:** ${videos.length} videos
- **Promedio de vistas por video:** **${averageViews.toLocaleString()}**
- **Total de likes acumulados:** **${totalLikes.toLocaleString()}**

---

## 🏆 Top 5 Videos con Mayor Tracción
${bestVideosList || '*No hay videos disponibles.*'}

---

## 🏷️ Ranking de Etiquetas Ganadoras (Tags)
Estas etiquetas mostraron la mayor tracción y promedio de visualizaciones. **Prioriza incluir estas etiquetas en las nuevas producciones.**

| # | Etiqueta | Usos | Vistas Promedio | Vistas Totales | Engagement |
|---|----------|------|-----------------|----------------|------------|
${tagsTableRows || '| 1 | Sin etiquetas suficientes | - | - | - | - |'}

---

## 💡 Recomendaciones Estratégicas para AutoProd
1. **Optimización de Títulos:** Modela los títulos de nuevos videos tomando como referencia la estructura de los Top 5 videos anteriores.
2. **Reutilización de Tags:** Incluye siempre entre 5 y 8 de las etiquetas con mayor promedio de vistas en el archivo \`config_video.md\`.
3. **Control de Saturación:** Revisa \`Historial_canal.md\` antes de crear una nueva carpeta para no abordar un ángulo idéntico.
`;

  // ──────────────────────────────────────────────
  // 4. Archivo 3: Historial_canal.md (Anti-Duplicados)
  // ──────────────────────────────────────────────
  const videosListTable = videos.map((v, idx) => 
    `| ${idx + 1} | [${v.title.replace(/\|/g, '-')}](${v.url}) | ${new Date(v.publishedAt).toLocaleDateString('es-ES')} | ${v.viewCount.toLocaleString()} | ${v.tags.slice(0, 4).join(', ') || '-'} |`
  ).join('\n');

  const ideasChecklist = publishedTitles.map(t => `- [x] ${t}`).join('\n');

  const markdownHistorial = `# 📜 Historial de Videos Publicados: ${channel.title}

> **INVENTARIO ANTI-DUPLICACIÓN:** Esta lista contiene los videos ya publicados en YouTube.
> El Agente de AutoProd y el modo **Pensamiento Profundo** consultan este archivo para **NO REPETIR IDEAS** en las próximas producciones.

---

## 🚫 Temáticas y Títulos Ya Realizados (No Duplicar)
${ideasChecklist || '*No hay títulos registrados.*'}

---

## 📋 Catálogo Cronológico de Videos
| # | Título del Video | Fecha | Vistas | Tags Clave |
|---|------------------|-------|--------|------------|
${videosListTable || '| 1 | Sin videos | - | - | - |'}
`;

  return {
    topTags,
    bestVideos,
    averageViews,
    totalLikes,
    contextSummaryText,
    markdownContexto,
    markdownMetricas,
    markdownHistorial,
  };
}
