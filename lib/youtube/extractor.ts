/**
 * YouTube Data API v3 Extractor
 * Maneja la comunicación con la API de YouTube para extraer metadatos del canal y sus videos.
 */

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnailUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  uploadsPlaylistId: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl?: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: string;
  url: string;
}

export interface ExtractedChannelData {
  channel: YouTubeChannelInfo;
  videos: YouTubeVideoItem[];
}

/**
 * Normaliza la entrada del usuario (URL completa, @handle, channelId o username)
 * y determina el tipo de identificador a consultar en YouTube API.
 */
export function parseChannelIdentifier(input: string): { type: 'handle' | 'id' | 'username' | 'search'; value: string } {
  let cleaned = input.trim();

  // Quitar parámetros de query o hash
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const url = new URL(cleaned);
      cleaned = url.pathname;
    }
  } catch {
    // Si no es URL válida, continuar con la cadena limpia
  }

  // Quitar barras iniciales y finales
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');

  // Detectar @handle (ej. @PawsAndPillows o /@PawsAndPillows)
  const handleMatch = cleaned.match(/@([a-zA-Z0-9_\-\.]+)/);
  if (handleMatch) {
    return { type: 'handle', value: `@${handleMatch[1]}` };
  }

  // Detectar Channel ID directo (ej. /channel/UCxxxxxxxxxxxxxxxxx)
  const channelIdMatch = cleaned.match(/channel\/(UC[a-zA-Z0-9_\-]{22})/i);
  if (channelIdMatch) {
    return { type: 'id', value: channelIdMatch[1] };
  }
  if (/^UC[a-zA-Z0-9_\-]{22}$/i.test(cleaned)) {
    return { type: 'id', value: cleaned };
  }

  // Detectar custom URL o user (ej. /c/Nombre o /user/Nombre)
  const userMatch = cleaned.match(/(?:c|user)\/([a-zA-Z0-9_\-\.]+)/i);
  if (userMatch) {
    return { type: 'username', value: userMatch[1] };
  }

  // Si empieza con @ pero no fue detectado por URL
  if (cleaned.startsWith('@')) {
    return { type: 'handle', value: cleaned };
  }

  // Fallback: tratar como handle si es una sola palabra alfanumérica, o búsqueda
  if (/^[a-zA-Z0-9_\-\.]+$/.test(cleaned)) {
    return { type: 'handle', value: `@${cleaned}` };
  }

  return { type: 'search', value: cleaned };
}

/**
 * Consulta YouTube Data API v3 para obtener la información básica y la playlist de uploads del canal.
 */
export async function fetchChannelInfo(identifierInput: string, apiKey: string): Promise<YouTubeChannelInfo> {
  const parsed = parseChannelIdentifier(identifierInput);
  const baseUrl = 'https://www.googleapis.com/youtube/v3';

  let channelUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&key=${encodeURIComponent(apiKey)}`;

  if (parsed.type === 'handle') {
    channelUrl += `&forHandle=${encodeURIComponent(parsed.value)}`;
  } else if (parsed.type === 'id') {
    channelUrl += `&id=${encodeURIComponent(parsed.value)}`;
  } else if (parsed.type === 'username') {
    channelUrl += `&forUsername=${encodeURIComponent(parsed.value)}`;
  } else {
    // Si es búsqueda libre, primero buscamos el canal
    const searchUrl = `${baseUrl}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(parsed.value)}&key=${encodeURIComponent(apiKey)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const err = await searchRes.json().catch(() => ({}));
      throw new Error(`Error en búsqueda de canal: ${err.error?.message || searchRes.statusText}`);
    }
    const searchData = await searchRes.json();
    const foundId = searchData.items?.[0]?.snippet?.channelId || searchData.items?.[0]?.id?.channelId;
    if (!foundId) {
      throw new Error(`No se encontró ningún canal de YouTube que coincida con "${identifierInput}"`);
    }
    channelUrl += `&id=${encodeURIComponent(foundId)}`;
  }

  let res = await fetch(channelUrl);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error de YouTube API (${res.status}): ${err.error?.message || res.statusText}`);
  }

  let data = await res.json();
  let item = data.items?.[0];

  // Si falló por forHandle (algunas versiones de API o canales antiguos), intentar fallback con search
  if (!item && parsed.type === 'handle') {
    const fallbackSearchUrl = `${baseUrl}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(parsed.value)}&key=${encodeURIComponent(apiKey)}`;
    const fallbackRes = await fetch(fallbackSearchUrl);
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const fallbackId = fallbackData.items?.[0]?.snippet?.channelId || fallbackData.items?.[0]?.id?.channelId;
      if (fallbackId) {
        const idUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&id=${encodeURIComponent(fallbackId)}&key=${encodeURIComponent(apiKey)}`;
        const idRes = await fetch(idUrl);
        if (idRes.ok) {
          const idData = await idRes.json();
          item = idData.items?.[0];
        }
      }
    }
  }

  if (!item) {
    throw new Error(`No se pudo encontrar el canal con el identificador proporcionado: "${identifierInput}". Verifica que la URL sea pública.`);
  }

  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const contentDetails = item.contentDetails || {};

  const uploadsPlaylistId = contentDetails.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error('El canal no tiene una lista de videos subidos accesible.');
  }

  return {
    id: item.id,
    title: snippet.title || 'Canal sin título',
    description: snippet.description || '',
    customUrl: snippet.customUrl || parsed.value,
    publishedAt: snippet.publishedAt || '',
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(stats.subscriberCount || '0', 10),
    videoCount: parseInt(stats.videoCount || '0', 10),
    viewCount: parseInt(stats.viewCount || '0', 10),
    uploadsPlaylistId,
  };
}

/**
 * Obtiene la lista de videos del canal paginando a través de la playlist de subidas.
 */
export async function fetchChannelVideos(uploadsPlaylistId: string, apiKey: string, maxVideos = 50): Promise<string[]> {
  const baseUrl = 'https://www.googleapis.com/youtube/v3';
  const videoIds: string[] = [];
  let pageToken = '';

  while (videoIds.length < maxVideos) {
    const fetchLimit = Math.min(50, maxVideos - videoIds.length);
    let playlistUrl = `${baseUrl}/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=${fetchLimit}&key=${encodeURIComponent(apiKey)}`;
    if (pageToken) {
      playlistUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(playlistUrl);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Error obteniendo videos de la lista de subidas (${res.status}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];
    for (const it of items) {
      const vId = it.contentDetails?.videoId;
      if (vId && !videoIds.includes(vId)) {
        videoIds.push(vId);
      }
    }

    pageToken = data.nextPageToken;
    if (!pageToken || items.length === 0) {
      break;
    }
  }

  return videoIds;
}

/**
 * Obtiene los detalles completos de cada video (tags, métricas, títulos, descripciones).
 */
export async function fetchVideosDetails(videoIds: string[], apiKey: string): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return [];

  const baseUrl = 'https://www.googleapis.com/youtube/v3';
  const detailedVideos: YouTubeVideoItem[] = [];

  // La API permite hasta 50 videos por petición
  const batchSize = 50;
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const chunk = videoIds.slice(i, i + batchSize);
    const videosUrl = `${baseUrl}/videos?part=snippet,statistics,contentDetails&id=${chunk.join(',')}&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(videosUrl);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Error obteniendo detalles de videos (${res.status}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      const snippet = item.snippet || {};
      const stats = item.statistics || {};
      const contentDetails = item.contentDetails || {};

      detailedVideos.push({
        id: item.id,
        title: snippet.title || 'Video sin título',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt || '',
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        tags: Array.isArray(snippet.tags) ? snippet.tags : [],
        viewCount: parseInt(stats.viewCount || '0', 10),
        likeCount: parseInt(stats.likeCount || '0', 10),
        commentCount: parseInt(stats.commentCount || '0', 10),
        duration: contentDetails.duration || '',
        url: `https://www.youtube.com/watch?v=${item.id}`,
      });
    }
  }

  // Ordenar por fecha de publicación descendente
  detailedVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return detailedVideos;
}

/**
 * Función principal que orquesta la extracción completa de un canal de YouTube.
 */
export async function extractFullChannel(inputUrlOrHandle: string, apiKey: string, maxVideos = 50): Promise<ExtractedChannelData> {
  const channel = await fetchChannelInfo(inputUrlOrHandle, apiKey);
  const videoIds = await fetchChannelVideos(channel.uploadsPlaylistId, apiKey, maxVideos);
  const videos = await fetchVideosDetails(videoIds, apiKey);

  return {
    channel,
    videos,
  };
}
