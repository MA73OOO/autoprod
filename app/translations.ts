export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Nav & Header
    logo: "AutoProdAI",
    tagline: "Herramienta de Producción para Creadores de Contenido",
    features: "Herramientas",
    howItWorks: "¿Cómo Funciona?",
    comparison: "Ventajas",
    studios: "Estudios",
    pricing: "Planes",
    faq: "Preguntas Frecuentes",
    docs: "Guías",
    login: "Iniciar Sesión",
    startFree: "Empezar Gratis",
    helperLocalActive: "Motor Conectado",
    helperLocalInactive: "Motor Desconectado",
    activeSession: "Sesión activa:",
    logout: "Cerrar Sesión",

    // Landing Hero
    heroBadge: "✨ PLATAFORMA TODO-EN-UNO",
    heroBrandName: "AutoProdai",
    heroMainHeadline: "Nunca había sido tan fácil",
    heroMainHeadlineHighlight: "producir tu contenido",
    heroSubheadline: "Crea, edita y escala tus videos con Inteligencia Artificial",
    heroSubtitle: "De la idea al render final en 4K. Diseña guiones con gancho, produce bucles continuos de hasta 3 horas, genera subtítulos automáticos y diseña portadas de alto CTR en un solo lugar.",
    heroCtaPrimary: "Comenzar Ahora Gratis",
    heroCtaSecondary: "Ver Cómo Funciona",
    heroTrust1: "Bucles y Videos de 1 a 3 Horas en 4K",
    heroTrust2: "Subtítulos Automáticos Sincronizados",
    heroTrust3: "Asistente de Guiones y Contenido",
    heroTrust4: "Tus Archivos Siempre en tu Poder",

    // 4 Pillars (Black Torch Inspired: Creativo, Producción, Analytics, Automatización)
    pillarsBadge: "4 PILARES DE AUTOPROD",
    pillarCreativeTitle: "Creativo",
    pillarCreativeTag: "FASE 01",
    pillarCreativeSlogan: "De la idea al concepto viral",
    pillarCreativeF1Title: "Asistente de Guiones IA",
    pillarCreativeF1Desc: "Ganchos de alta retención e ideas de contenido validadas.",
    pillarCreativeF2Title: "Portadas & Miniaturas CTR",
    pillarCreativeF2Desc: "Diseño 16:9 y 9:16 vertical para Shorts que atraen miradas.",
    pillarCreativeF3Title: "Biblioteca Multimedia",
    pillarCreativeF3Desc: "Música, efectos sonoros y fondos visuales listos para usar.",

    pillarProductionTitle: "Producción",
    pillarProductionTag: "FASE 02",
    pillarProductionSlogan: "Ensamble y renderizado nativo 4K",
    pillarProductionF1Title: "Bucles de 1 a 3 Horas en 4K",
    pillarProductionF1Desc: "Sincronización continua de audio y video sin cortes.",
    pillarProductionF2Title: "Recortes y Clips Rápidos",
    pillarProductionF2Desc: "Extrae clips verticales en segundos para Shorts y Reels.",
    pillarProductionF3Title: "Subtítulos Dinámicos",
    pillarProductionF3Desc: "Subtitulado palabra por palabra exportable a CapCut y Premiere.",

    pillarAnalyticsTitle: "Analytics",
    pillarAnalyticsTag: "FASE 03",
    pillarAnalyticsSlogan: "Inteligencia de nicho y retención",
    pillarAnalyticsF1Title: "Extractor de Canales YouTube",
    pillarAnalyticsF1Desc: "Analiza qué contenidos y palabras clave funcionan a otros creadores.",
    pillarAnalyticsF2Title: "Detección de Temas y Ganchos",
    pillarAnalyticsF2Desc: "Identifica fórmulas virales antes de escribir una sola línea.",
    pillarAnalyticsF3Title: "Memoria Histórica del Canal",
    pillarAnalyticsF3Desc: "Registro de temas ya cubiertos para no repetir ideas.",

    pillarAutomationTitle: "Automatización",
    pillarAutomationTag: "FASE 04",
    pillarAutomationSlogan: "Cronograma y flujo desatendido",
    pillarAutomationF1Title: "Calendario de Publicación",
    pillarAutomationF1Desc: "Cronograma visual con slots y fechas programadas por canal.",
    pillarAutomationF2Title: "Cola de Render Desatendido",
    pillarAutomationF2Desc: "Procesa y exporta múltiples videos en segundo plano sin pausas.",
    pillarAutomationF3Title: "Pipeline de Video Integral",
    pillarAutomationF3Desc: "Del guion aprobado al render final sin fricción manual.",

    // Interactive Mockup Selector
    mockupTabAgent: "💡 Asistente Creativo",
    mockupTabLooper: "🎬 Videos Largos y Bucles",
    mockupTabWhisper: "🎙️ Subtítulos Dinámicos",
    mockupTabImages: "🎯 Miniaturas de Alto Clic",
    mockupTabWorkspace: "🗂️ Organización de Canales",

    // Mockup Card Details
    mockupAgentTitle: "Asistente de Estrategia y Guiones",
    mockupAgentDesc: "Diseña la estructura de tus videos, investiga ideas de contenido y redacta ganchos que atrapan al espectador desde el primer segundo.",
    mockupLooperTitle: "Estudio de Videos Largos y Bucles",
    mockupLooperDesc: "Crea videos de 1 a 3 horas para música, lofi, relajación o fondos visuales con sincronización perfecta de audio y video.",
    mockupWhisperTitle: "Subtítulos Automáticos Palabra por Palabra",
    mockupWhisperDesc: "Genera subtítulos dinámicos de alta precisión y expórtalos listos para CapCut, Premiere o YouTube.",
    mockupImagesTitle: "Creador de Portadas y Miniaturas",
    mockupImagesDesc: "Diseña portadas que destacan en el feed de YouTube en formato horizontal (16:9) y vertical para Shorts (9:16).",
    mockupWorkspaceTitle: "Gestión Ordenada de tus Canales",
    mockupWorkspaceDesc: "Ten los guiones, audios, recursos visuales y versiones finales de cada canal en un solo lugar ordenado.",

    // Landing Comparison: Old vs AutoProd
    compTitle: "Diseñado para Creadores que Quieren Resultados, no Complicaciones",
    compSubtitle: "Editar, subtitular, recortar clips, comprimir metraje y crear portadas suele requerir 5 suscripciones distintas y pelear con programas pesados. AutoProd reúne las herramientas esenciales de producción audiovisual en un solo entorno ágil y directo.",
    compOldHeader: "La Forma Tradicional (El Caos de Múltiples Herramientas)",
    compOld1: "Saltar entre redactores de texto, editores de video pesados, herramientas de subtítulos y carpetas desordenadas.",
    compOld2: "Plataformas en la nube que cobran costosas suscripciones y te imponen límites de exportación arbitrarios.",
    compOld3: "Horas esperando que un servidor remoto procese tu video para terminar con una calidad comprimida o pixelada.",
    compOld4: "Empezar cada video desde cero, sin mantener la identidad, guiones ni recursos gráficos de tu canal.",
    compNewHeader: "La Experiencia AutoProd (Un Solo Ecosistema Integrado)",
    compNew1: "Todo tu flujo en un solo lugar: Guiones con gancho, generación de video, subtítulos palabra por palabra y portadas a un clic.",
    compNew2: "Loops, Clips y Compresión: Crea bucles continuos de 1 a 3 horas, extrae clips rápidos de tus videos y comprime sin perder calidad.",
    compNew3: "Aprovecha la potencia de tu equipo para renderizar a velocidad nativa sin costos sorpresa ni esperas en la nube.",
    compNew4: "Memoria de tus proyectos: Tus ideas, recursos multimedia y formatos se conservan para que cada nuevo video sea más rápido.",

    // Landing Features (The 4 Studios & Orchestrator)
    featuresTitle: "Herramientas de Alto Impacto para Cualquier Creador de Contenido",
    featuresSubtitle: "Tanto si automatizas canales, como si te grabas a ti mismo, cortas clips de directos o editas para clientes: todo lo que necesitas para producir más video en menos tiempo.",

    studioLooperTitle: "Estudio de Bucles, Clips y Compresión",
    studioLooperBadge: "BUCLES Y RECORTES",
    studioLooperDesc: "Crea bucles de video continuos de 1 a 3 horas con sincronización de audio perfecta, corta clips rápidos para Shorts o Reels y comprime tus archivos a máxima calidad en 1080p y 4K.",

    studioWhisperTitle: "Subtítulos Dinámicos en Segundos",
    studioWhisperBadge: "ALTA PRECISIÓN",
    studioWhisperDesc: "Transcribe cualquier audio o clip de video de forma automática con sincronización palabra por palabra. Genera subtítulos estilo viral para Shorts, Reels y videos horizontales, listos para CapCut o Premiere.",

    studioImagesTitle: "Miniaturas que Generan Clics",
    studioImagesBadge: "ALTO CTR",
    studioImagesDesc: "Crea portadas llamativas que invitan al clic analizando estilos visuales exitosos. Diseña tanto para el formato clásico de YouTube (16:9) como para contenido vertical (9:16).",

    studioAssetsTitle: "Biblioteca de Recursos Multimedia",
    studioAssetsBadge: "ORGANIZADOR CENTRAL",
    studioAssetsDesc: "Ten tus pistas de música, efectos de sonido, fondos visuales y logos siempre listos para arrastrar a tus videos sin perder tiempo buscando en tu computadora.",

    studioAgentTitle: "Asistente Inteligente de Producción",
    studioAgentBadge: "COPILOTO CREATIVO",
    studioAgentDesc: "Tu compañero de trabajo para planificar contenidos, redactar títulos atractivos, redactar guiones estructurados y organizar cada paso de tu producción.",

    // Landing How it works
    howItWorksTitle: "De la Idea a la Publicación en 3 Pasos Simples",
    howItWorksSubtitle: "Una forma fluida de crear contenido constante sin agotarte en tareas repetitivas.",
    step1Title: "1. Define tu Proyecto y Contenido",
    step1Desc: "Organiza tus proyectos por canal. El asistente te ayuda a estructurar ganchos de retención, investigar temas de alto interés y redactar descripciones.",
    step2Title: "2. Ensambla, Corta o Subtitula",
    step2Desc: "Genera bucles sincronizados con música, recorta clips destacados o subtitula palabra por palabra de forma automática.",
    step3Title: "3. Exporta en Máxima Calidad",
    step3Desc: "Obtén tu video renderizado en alta definición listo para publicar, junto con su miniatura optimizada para conseguir más visualizaciones.",

    // FAQ Section
    faqTitle: "Preguntas Frecuentes",
    faqSubtitle: "Respuestas directas a las dudas más comunes de los creadores.",
    faq1Q: "¿Para quién está pensado AutoProd?",
    faq1A: "Para cualquier persona que cree contenido en video, automatice o no. Sirve tanto si te grabas a ti mismo, si manejas canales automatizados, si cortas clips de directos, si haces compilaciones con música o si necesitas comprimir, crear loops rápidos y subtitular sin depender de software pesado ni pagar múltiples suscripciones.",
    faq2Q: "¿Qué duración de videos puedo producir en AutoProd?",
    faq2A: "Puedes crear desde Shorts y Reels de 30 a 60 segundos hasta bucles y producciones musicales de 1 a 3 horas continuas, renderizadas localmente en tu equipo con calidad hasta 4K.",
    faq3Q: "¿Puedo usar mis videos en editores como CapCut o Premiere?",
    faq3A: "Sí. Los subtítulos se exportan en formatos estándar (.srt, .vtt) y los videos en MP4 de alta calidad para que puedas editarlos o subirlos directamente a YouTube.",
    faq4Q: "¿Mis archivos y contenidos se mantienen privados?",
    faq4A: "Completamente. Tus videos, audios y materiales originales se procesan y quedan guardados en tu propia computadora; tu contenido nunca se comparte ni se almacena para terceros.",

    // Footer
    allRightsReserved: "Todos los derechos reservados.",
    footerDesc: "La herramienta integral para crear, automatizar y escalar canales de YouTube.",
    harness: "Herramientas",

    // Dashboard Left Sidebar & Navigation
    geminiKeyTitle: "Llave de IA (Opcional)",
    saveKeyBtn: "Guardar Llave",
    savedKeyBtn: "🔑 Llave Guardada",
    channelsTitle: "Canales & Proyectos",
    activeTemplatesTitle: "Plantillas Activas",

    // Dashboard Studios Switcher
    viewHome: "Inicio",
    viewChat: "Asistente IA",
    viewLooper: "Videos Largos",
    viewSubtitles: "Subtítulos",
    viewImages: "Miniaturas",
    viewAssets: "Recursos",

    // Dashboard Center Chat
    welcomeChatMsg: "¡Hola! Soy tu asistente de producción. ¿Qué video o canal vamos a trabajar hoy?",
    interceptorTitle: "🚀 Mejoras del Video",
    chkCta: "Llamada a la Acción",
    chkTimestamps: "Capítulos (Timestamps)",
    chkTags: "Etiquetas Clave",
    chkThumbnail: "Sugerir Portada",
    promptPlaceholder: "Escribe una instrucción (ej: 'Ayúdame a crear un video de música relajante para estudiar')...",
    sendBtn: "Enviar",

    // Dashboard Right Panel
    thumbnailTitle: "Portada Generada",
    regenerateThumbnail: "Regenerar Portada",
    metadataTitle: "Metadatos del Video",
    optTitleLabel: "Título Sugerido",
    tagsLabel: "Etiquetas",
    descLabel: "Descripción",
    localRenderTitle: "Renderizado",
    startRenderBtn: "🎬 Iniciar Creación de Video",
    renderingProgress: "Creando video...",
    renderDisclaimer: "El video se generará en tu computadora a máxima calidad.",

    // Profile Dropdown
    myAccount: "Mi Cuenta",
    configGeneral: "Configuración General",
    myInfo: "👤 Mis Datos",
    billingPlan: "💳 Plan & Créditos",
    changePassword: "🔑 Cambiar Contraseña",
    redirecting: "Redirigiendo a"
  },

  en: {
    // Nav & Header
    logo: "AutoProd",
    tagline: "Content Creation Platform for YouTubers",
    features: "Tools",
    howItWorks: "How It Works",
    comparison: "Advantages",
    studios: "Studios",
    pricing: "Pricing",
    faq: "FAQ",
    docs: "Guides",
    login: "Log In",
    startFree: "Start Free",
    helperLocalActive: "Motor Connected",
    helperLocalInactive: "Motor Disconnected",
    activeSession: "Active session:",
    logout: "Log Out",

    // Landing Hero
    heroBadge: "✨ ALL-IN-ONE PLATFORM",
    heroBrandName: "AutoProdai",
    heroMainHeadline: "Producing your content has never been",
    heroMainHeadlineHighlight: "this easy",
    heroSubheadline: "Create, edit and scale your videos with Artificial Intelligence",
    heroSubtitle: "From raw idea to final 4K render. Outline high-hook scripts, build 1 to 3 hour continuous loops, generate auto-synced captions, and design standout thumbnails in one studio.",
    heroCtaPrimary: "Get Started Free",
    heroCtaSecondary: "See How It Works",
    heroTrust1: "1 to 3 Hour Seamless Loops in 4K",
    heroTrust2: "Auto-Synced Captions",
    heroTrust3: "AI Content & Script Assistant",
    heroTrust4: "Your Files Always Under Your Control",

    // 4 Pillars (Black Torch Inspired: Creativo, Producción, Analytics, Automatización)
    pillarsBadge: "4 AUTOPROD PILLARS",
    pillarCreativeTitle: "Creative",
    pillarCreativeTag: "PHASE 01",
    pillarCreativeSlogan: "From idea to viral concept",
    pillarCreativeF1Title: "AI Script Assistant",
    pillarCreativeF1Desc: "Retention-engineered hooks and validated topic research.",
    pillarCreativeF2Title: "High-CTR Thumbnails",
    pillarCreativeF2Desc: "16:9 feed covers and 9:16 vertical Shorts designs.",
    pillarCreativeF3Title: "Media Asset Library",
    pillarCreativeF3Desc: "Music tracks, sound effects, and backgrounds ready to deploy.",

    pillarProductionTitle: "Production",
    pillarProductionTag: "PHASE 02",
    pillarProductionSlogan: "Native 4K rendering & assembly",
    pillarProductionF1Title: "1 to 3 Hour Loops in 4K",
    pillarProductionF1Desc: "Seamless continuous audiovisual loops without frame drops.",
    pillarProductionF2Title: "Fast Highlight Clipper",
    pillarProductionF2Desc: "Extract quick vertical clips for Shorts, Reels, and TikTok.",
    pillarProductionF3Title: "Dynamic Word-by-Word Captions",
    pillarProductionF3Desc: "Precise kinetic subtitles exported to CapCut and Premiere.",

    pillarAnalyticsTitle: "Analytics",
    pillarAnalyticsTag: "PHASE 03",
    pillarAnalyticsSlogan: "Niche intelligence & audience retention",
    pillarAnalyticsF1Title: "YouTube Channel Extractor",
    pillarAnalyticsF1Desc: "Inspect competitor topics, title hooks, and tag patterns.",
    pillarAnalyticsF2Title: "Trend & Hook Detection",
    pillarAnalyticsF2Desc: "Identify high-performing storytelling patterns in your niche.",
    pillarAnalyticsF3Title: "Channel History Memory",
    pillarAnalyticsF3Desc: "Tracks past covered topics so you never duplicate content.",

    pillarAutomationTitle: "Automation",
    pillarAutomationTag: "PHASE 04",
    pillarAutomationSlogan: "Scheduled pipeline & background flow",
    pillarAutomationF1Title: "Smart Release Calendar",
    pillarAutomationF1Desc: "Visual release timeline with scheduled channel slots.",
    pillarAutomationF2Title: "Unattended Render Queue",
    pillarAutomationF2Desc: "Batch process and export queued videos in the background.",
    pillarAutomationF3Title: "End-to-End Video Pipeline",
    pillarAutomationF3Desc: "From approved draft to finalized export without manual friction.",

    // Interactive Mockup Selector
    mockupTabAgent: "💡 Creative Assistant",
    mockupTabLooper: "🎬 Long Videos & Loops",
    mockupTabWhisper: "🎙️ Dynamic Subtitles",
    mockupTabImages: "🎯 High-CTR Thumbnails",
    mockupTabWorkspace: "🗂️ Channel Organizer",

    // Mockup Card Details
    mockupAgentTitle: "Strategy & Script Assistant",
    mockupAgentDesc: "Structure your video projects, research fresh topic ideas, and write compelling hooks that keep viewers watching from the very first second.",
    mockupLooperTitle: "Long Video & Loop Studio",
    mockupLooperDesc: "Create 1 to 3 hour videos for music, lofi, relaxation, or ambient channels with seamless audio and video synchronization.",
    mockupWhisperTitle: "Word-by-Word Automatic Subtitles",
    mockupWhisperDesc: "Generate ultra-precise kinetic subtitles ready to export directly to CapCut, Premiere, or YouTube.",
    mockupImagesTitle: "Thumbnail & Cover Designer",
    mockupImagesDesc: "Design standout thumbnails optimized for the YouTube feed in horizontal 16:9 and vertical 9:16 Shorts format.",
    mockupWorkspaceTitle: "Organized Channel Management",
    mockupWorkspaceDesc: "Keep your scripts, audio tracks, visual assets, and finalized renders neatly organized per channel in one place.",

    // Landing Comparison: Old vs AutoProd
    compTitle: "Built for Creators Who Want Results, Not Complexities",
    compSubtitle: "Editing, captioning, cutting clips, compressing footage, and making thumbnails usually means paying for 5 separate subscriptions and wrestling bloated software. AutoProd unites essential video production tools into one fast, streamlined environment.",
    compOldHeader: "The Traditional Way (Chaos of Multiple Tools)",
    compOld1: "Constantly switching between text writers, heavy video editors, caption tools, and cluttered desktop folders.",
    compOld2: "Cloud platforms charging high monthly fees while imposing arbitrary export limits.",
    compOld3: "Waiting hours for remote cloud servers to render, only to end up with low-bitrate compressed video.",
    compOld4: "Starting every video from scratch with no memory of your channel's unique voice or audience style.",
    compNewHeader: "The AutoProd Experience (One Unified Studio)",
    compNew1: "Your complete workflow in one place: High-hook scripts, video generation, word-synced subtitles, and thumbnails in a click.",
    compNew2: "Loops, Clips & Compression: Build 1 to 3 hour continuous loops, extract fast video highlights, and compress without quality loss.",
    compNew3: "Tap into your own machine's hardware for rapid rendering without surprise server fees or cloud queues.",
    compNew4: "Channel memory: Your ideas, tone, and visual assets stay organized so each subsequent video is faster.",

    // Landing Features (The 4 Studios & Orchestrator)
    featuresTitle: "High-Impact Production Tools for Any Content Creator",
    featuresSubtitle: "Whether you automate channels, film yourself on camera, cut stream clips, or edit for clients: everything you need to produce more video in less time.",

    studioLooperTitle: "Loops, Clips & Video Optimizer",
    studioLooperBadge: "LOOPS & CLIPS",
    studioLooperDesc: "Build seamless 1 to 3 hour continuous loops with smooth audio transitions, extract quick clips for Shorts and Reels, and compress video in 1080p and 4K without headaches.",

    studioWhisperTitle: "Dynamic Captions in Seconds",
    studioWhisperBadge: "PINPOINT ACCURACY",
    studioWhisperDesc: "Transcribe any spoken audio or video clip automatically with word-level synchronization. Produce viral-style captions for Shorts, Reels, and long videos, ready for CapCut or Premiere.",

    studioImagesTitle: "Thumbnails That Drive Clicks",
    studioImagesBadge: "HIGH CTR",
    studioImagesDesc: "Design eye-catching thumbnails that stand out in the YouTube feed by analyzing successful visual styles. Works for both 16:9 widescreen and vertical 9:16 formats.",

    studioAssetsTitle: "Central Media Asset Hub",
    studioAssetsBadge: "CENTRAL ORGANIZER",
    studioAssetsDesc: "Keep your soundtrack tracks, audio sound effects, video clips, and watermarks organized and ready to drag into your projects without hunting through your hard drive.",

    studioAgentTitle: "AI Production Copilot",
    studioAgentBadge: "CREATIVE COPILOT",
    studioAgentDesc: "Your partner for planning content topics, generating strong hooks, drafting retention-optimized scripts, and keeping every video organized.",

    // Landing How it works
    howItWorksTitle: "From Raw Idea to Published Video in 3 Easy Steps",
    howItWorksSubtitle: "A smoother way to build a consistent publishing schedule without burning out.",
    step1Title: "1. Define Your Project & Topic",
    step1Desc: "Organize projects by channel. The assistant helps you research proven topics, craft engaging titles, and outline retention hooks.",
    step2Title: "2. Combine, Cut, or Caption",
    step2Desc: "Generate seamless loops with music, trim viral highlight clips, or generate word-synced subtitles automatically.",
    step3Title: "3. Export in Crystal-Clear Quality",
    step3Desc: "Get your finished video in high definition ready to upload, complete with an eye-catching thumbnail to maximize views.",

    // FAQ Section
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Clear answers to the most common questions from creators.",
    faq1Q: "Who is AutoProd designed for?",
    faq1A: "For anyone who produces video content—automated or not. It's built for on-camera creators, faceless channel operators, stream clip editors, music curators, and anyone who needs to compress video, loop clips seamlessly, and add auto-subtitles without wrestling heavy software or juggling multiple subscriptions.",
    faq2Q: "What video lengths can I produce with AutoProd?",
    faq2A: "You can create anything from 30-60 second Shorts and Reels to 1 to 3 hour continuous music compilations and loops, rendered on your machine up to 4K without arbitrary cuts.",
    faq3Q: "Can I use my projects in CapCut or Premiere?",
    faq3A: "Yes. Subtitles export in standard formats (.srt, .vtt) and videos export in clean, high-bitrate MP4s so you can edit further or upload straight to YouTube.",
    faq4Q: "Are my files and media kept private?",
    faq4A: "Absolutely. Your original video footage, audio, and renders remain on your computer; your creative files are never uploaded or shared with third parties.",

    // Footer
    allRightsReserved: "All rights reserved.",
    footerDesc: "The all-in-one platform to create, automate, and grow YouTube channels.",
    harness: "Tools",

    // Dashboard Left Sidebar & Navigation
    geminiKeyTitle: "AI Key (Optional)",
    saveKeyBtn: "Save Key",
    savedKeyBtn: "🔑 Key Saved",
    channelsTitle: "Channels & Projects",
    activeTemplatesTitle: "Active Templates",

    // Dashboard Studios Switcher
    viewHome: "Home",
    viewChat: "AI Assistant",
    viewLooper: "Long Videos",
    viewSubtitles: "Subtitles",
    viewImages: "Thumbnails",
    viewAssets: "Assets",

    // Dashboard Center Chat
    welcomeChatMsg: "Hello! I am your production assistant. Which channel or video are we working on today?",
    interceptorTitle: "🚀 Video Enhancer",
    chkCta: "Call to Action",
    chkTimestamps: "Timestamps",
    chkTags: "Keywords",
    chkThumbnail: "Suggest Thumbnail",
    promptPlaceholder: "Type an instruction (e.g. 'Help me create a relaxing study music video')...",
    sendBtn: "Send",

    // Dashboard Right Panel
    thumbnailTitle: "Generated Thumbnail",
    regenerateThumbnail: "Regenerate Thumbnail",
    metadataTitle: "Video Metadata",
    optTitleLabel: "Suggested Title",
    tagsLabel: "Tags",
    descLabel: "Description",
    localRenderTitle: "Rendering",
    startRenderBtn: "🎬 Start Video Creation",
    renderingProgress: "Generating video...",
    renderDisclaimer: "The video will be generated on your computer at full quality.",

    // Profile Dropdown
    myAccount: "My Account",
    configGeneral: "General Settings",
    myInfo: "👤 My Profile",
    billingPlan: "💳 Plan & Credits",
    changePassword: "🔑 Change Password",
    redirecting: "Redirecting to"
  }
};
