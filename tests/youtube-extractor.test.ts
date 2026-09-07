import { parseChannelIdentifier, ExtractedChannelData, YouTubeVideoItem } from '../lib/youtube/extractor';
import { processChannelAnalytics, analyzeTags } from '../lib/youtube/analytics';

console.log('🧪 Iniciando pruebas de Extractor y Analítica de YouTube...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASÓ: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FALLÓ: ${testName}`);
    failed++;
  }
}

// ──────────────────────────────────────────────
// 1. Pruebas de parseChannelIdentifier
// ──────────────────────────────────────────────
console.log('\n--- 1. Pruebas de Normalización de URLs de YouTube ---');

const test1 = parseChannelIdentifier('https://www.youtube.com/@PawsAndPillows');
assert(test1.type === 'handle' && test1.value === '@PawsAndPillows', 'URL con @handle canónico');

const test2 = parseChannelIdentifier('https://youtube.com/@FinanzasReales/videos');
assert(test2.type === 'handle' && test2.value === '@FinanzasReales', 'URL con @handle y sufijo /videos');

const test3 = parseChannelIdentifier('@GatitosTiernos');
assert(test3.type === 'handle' && test3.value === '@GatitosTiernos', 'Handle directo con @');

const test4 = parseChannelIdentifier('https://www.youtube.com/channel/UC1234567890123456789012');
assert(test4.type === 'id' && test4.value === 'UC1234567890123456789012', 'URL de Channel ID canónico (UC...)');

const test5 = parseChannelIdentifier('UC1234567890123456789012');
assert(test5.type === 'id' && test5.value === 'UC1234567890123456789012', 'ID directo (UC...)');

const test6 = parseChannelIdentifier('https://www.youtube.com/c/CanalDePrueba');
assert(test6.type === 'username' && test6.value === 'CanalDePrueba', 'Custom URL /c/username');

// ──────────────────────────────────────────────
// 2. Pruebas de Analítica y Minería de Tags
// ──────────────────────────────────────────────
console.log('\n--- 2. Pruebas de Minería de Etiquetas (Tags) y Métricas ---');

const mockVideos: YouTubeVideoItem[] = [
  {
    id: 'vid_1',
    title: '5 Consejos para Dormir a tu Gato en 10 Minutos',
    description: 'Guía práctica para relajar a tus gatitos.',
    publishedAt: '2026-01-10T12:00:00Z',
    tags: ['gatos', 'dormir gatos', 'mascotas', 'relajacion'],
    viewCount: 50000,
    likeCount: 2500,
    commentCount: 150,
    url: 'https://www.youtube.com/watch?v=vid_1'
  },
  {
    id: 'vid_2',
    title: 'Música Relajante para Gatos con Ansiedad (Sonido de Lluvia)',
    description: 'Música calmante para felinos nerviosos.',
    publishedAt: '2026-02-01T12:00:00Z',
    tags: ['gatos', 'musica gatos', 'sonido lluvia', 'relajacion'],
    viewCount: 120000,
    likeCount: 6000,
    commentCount: 400,
    url: 'https://www.youtube.com/watch?v=vid_2'
  },
  {
    id: 'vid_3',
    title: 'Qué Hacer Si Tu Gatito No Quiere Comer',
    description: 'Soluciones rápidas para alimentación felina.',
    publishedAt: '2026-02-15T12:00:00Z',
    tags: ['gatos', 'salud felina', 'alimentacion'],
    viewCount: 15000,
    likeCount: 800,
    commentCount: 90,
    url: 'https://www.youtube.com/watch?v=vid_3'
  }
];

const mockChannelData: ExtractedChannelData = {
  channel: {
    id: 'UC_TEST_CHANNEL_12345678',
    title: 'Paws & Pillows',
    description: 'El mejor canal de relajación y cuidado para mascotas.',
    customUrl: '@PawsAndPillows',
    publishedAt: '2023-05-15T00:00:00Z',
    thumbnailUrl: 'https://example.com/avatar.jpg',
    subscriberCount: 85000,
    videoCount: 45,
    viewCount: 3500000,
    uploadsPlaylistId: 'UU_TEST_CHANNEL_12345678'
  },
  videos: mockVideos
};

const tagMetrics = analyzeTags(mockVideos);
assert(tagMetrics.length > 0, 'Generó lista de métricas de etiquetas');
const tagGatos = tagMetrics.find(t => t.tag === 'gatos');
assert(tagGatos !== undefined && tagGatos.count === 3, 'Etiqueta "gatos" detectada en 3 videos');
assert(tagGatos!.totalViews === 185000, 'Suma de vistas correcta para "gatos" (185,000)');

const tagRelajacion = tagMetrics.find(t => t.tag === 'relajacion');
assert(tagRelajacion !== undefined && tagRelajacion.count === 2, 'Etiqueta "relajacion" detectada en 2 videos');

// ──────────────────────────────────────────────
// 3. Pruebas de Generación de Contexto y Markdown
// ──────────────────────────────────────────────
console.log('\n--- 3. Pruebas de Generación de Archivos Markdown y Vector Summary ---');

const analytics = processChannelAnalytics(mockChannelData);

assert(analytics.averageViews === Math.round((50000 + 120000 + 15000) / 3), 'Promedio de vistas calculado correctamente');
assert(analytics.bestVideos[0].id === 'vid_2', 'El video con más vistas (120k) lidera los mejores videos');

assert(analytics.contextSummaryText.includes('Paws & Pillows'), 'Resumen vectorial contiene el nombre del canal');
assert(analytics.contextSummaryText.includes('85') && analytics.contextSummaryText.includes('suscriptores'), 'Resumen vectorial contiene conteo de suscriptores');
assert(analytics.contextSummaryText.includes('anti-duplicación'), 'Resumen vectorial incluye directiva anti-duplicación');

// Validar archivos Markdown
assert(analytics.markdownContexto.includes('# 📺 Contexto y Guía de Identidad: Paws & Pillows'), 'Contexto_canal.md tiene el título correcto');
assert(analytics.markdownMetricas.includes('Ranking de Etiquetas Ganadoras'), 'Metricas_canal.md incluye tabla de tags ganadoras');
assert(analytics.markdownHistorial.includes('Temáticas y Títulos Ya Realizados (No Duplicar)'), 'Historial_canal.md incluye sección anti-duplicación');
assert(analytics.markdownHistorial.includes('Música Relajante para Gatos'), 'Historial_canal.md incluye los títulos de videos existentes');

// ──────────────────────────────────────────────
// Resumen
// ──────────────────────────────────────────────
console.log(`\n🏁 Resultado de las pruebas: ${passed} pasaron, ${failed} fallaron.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ ¡Todas las pruebas del Extractor y Analítica pasaron satisfactoriamente!');
}
