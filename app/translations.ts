export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Nav & Header
    logo: "AutoProd",
    features: "Características",
    howItWorks: "Cómo Funciona",
    docs: "Docs",
    login: "Iniciar Sesión",
    startFree: "Comenzar Gratis",
    helperLocalActive: "Activo (localhost:4812)",
    helperLocalInactive: "Inactivo",
    activeSession: "Sesión activa:",
    logout: "Cerrar Sesión",
    
    // Landing Hero
    heroBadge: "🚀 Nueva Arquitectura Híbrida $0 USD",
    heroTitle: "Automatiza tus Videos de YouTube con ",
    heroTitleHighlight: "Inteligencia Artificial",
    heroSubtitle: "Optimiza tus descripciones y prompts con Gemini BYOK y renderiza videos en lote usando tu propia GPU local sin gastar un solo dólar en servidores en la nube.",
    howItWorksBtn: "Ver cómo funciona",
    
    // Landing Features
    featuresTitle: "Herramientas potentes para creadores avanzados",
    featuresSubtitle: "Una suite de automatización integrada diseñada específicamente para creadores que buscan maximizar su alcance y velocidad.",
    feat1Title: "Gemini Co-Pilot (BYOK)",
    feat1Desc: "Utiliza tu propia API Key de Google AI Studio para optimizar títulos, etiquetas y descripciones de manera 100% gratuita e ilimitada.",
    feat2Title: "Renderizador Local Helper",
    feat2Desc: "El agente de renderizado se ejecuta localmente en tu computadora enlazado por FastAPI. Renderiza tus videos en lote de forma transparente y sin límite de minutos.",
    feat3Title: "Interceptor de Prompts SEO",
    feat3Desc: "Checklist pre-flight que analiza y enriquece tu prompt con marcadores de posición, llamadas a la acción y etiquetas dinámicas antes de mandarlo a la IA.",
    
    // Landing How it works
    howItWorksTitle: "¿Cómo funciona la Arquitectura Híbrida?",
    howItWorksSubtitle: "Diseñado inteligentemente para que puedas automatizar tus canales sin incurrir en costos recurrentes de servidores o infraestructura en la nube.",
    step1Title: "Conectas tu API Key",
    step1Desc: "Agregas tu llave gratuita de Google AI Studio (Gemini). Ésta se almacena encriptada únicamente en tu navegador de forma segura.",
    step2Title: "Levantas el Helper Local",
    step2Desc: "Ejecutas una línea de comando en tu máquina que levanta nuestro helper local en Python en el puerto `4812`. Éste se conecta en tiempo real con nuestra aplicación.",
    step3Title: "Generación & Renderizado Automático",
    step3Desc: "Crea y planifica tus videos desde el panel web de AutoProd. La IA de Gemini creará los metadatos SEO y mandará la señal al Helper para que empiece a compilar los recursos locales de video y audio usando tu potencia local.",
    
    // Footer
    allRightsReserved: "Todos los derechos reservados.",
    harness: "Arnés",
    
    // Dashboard Left Sidebar
    geminiKeyTitle: "Gemini Key (BYOK)",
    saveKeyBtn: "Guardar Clave",
    savedKeyBtn: "🔑 Key Guardada",
    channelsTitle: "Canales & Proyectos",
    activeTemplatesTitle: "Plantillas Activas",
    
    // Dashboard Center Chat
    welcomeChatMsg: "¡Hola! Soy tu Co-Pilot de AutoProd. Selecciona un proyecto y configuramos el prompt SEO o preparemos el renderizado.",
    interceptorTitle: "🚀 Interceptor",
    chkCta: "Incluir CTA",
    chkTimestamps: "Timestamps",
    chkTags: "15 Tags SEO",
    chkThumbnail: "Generar Portada",
    promptPlaceholder: "Escribe un prompt para optimizar el video...",
    sendBtn: "Enviar",
    
    // Dashboard Right Panel
    thumbnailTitle: "Portada Generada",
    regenerateThumbnail: "Regenerar Portada",
    metadataTitle: "Metadatos SEO Generados",
    optTitleLabel: "Título Optimizado",
    tagsLabel: "Tags (Etiquetas)",
    descLabel: "Descripción",
    localRenderTitle: "Render Local",
    startRenderBtn: "🎬 Iniciar Renderizado de Video",
    renderingProgress: "Procesando lote...",
    renderDisclaimer: "Se compilarán pistas en Resultado/ usando tu CPU/GPU local.",
    
    // Profile Dropdown
    myAccount: "Mi Cuenta",
    configGeneral: "⚙️ Configuración General",
    myInfo: "👤 Mis Datos",
    billingPlan: "💳 Datos de Pago & Plan",
    changePassword: "🔑 Cambiar Contraseña",
    redirecting: "Redirigiendo a"
  },
  en: {
    // Nav & Header
    logo: "AutoProd",
    features: "Features",
    howItWorks: "How It Works",
    docs: "Docs",
    login: "Log In",
    startFree: "Start Free",
    helperLocalActive: "Active (localhost:4812)",
    helperLocalInactive: "Inactive",
    activeSession: "Active session:",
    logout: "Log Out",
    
    // Landing Hero
    heroBadge: "🚀 New Hybrid Architecture $0 USD",
    heroTitle: "Automate your YouTube Videos with ",
    heroTitleHighlight: "Artificial Intelligence",
    heroSubtitle: "Optimize your descriptions and prompts with Gemini BYOK and render videos in batches using your own local GPU without spending a single dollar on cloud servers.",
    howItWorksBtn: "See how it works",
    
    // Landing Features
    featuresTitle: "Powerful tools for advanced creators",
    featuresSubtitle: "An integrated automation suite designed specifically for creators seeking to maximize their reach and speed.",
    feat1Title: "Gemini Co-Pilot (BYOK)",
    feat1Desc: "Use your own Google AI Studio API Key to optimize titles, tags, and descriptions completely free of charge and limitlessly.",
    feat2Title: "Local Helper Renderer",
    feat2Desc: "The rendering agent runs locally on your computer linked via FastAPI. Render your videos in batches transparently and with no time limit.",
    feat3Title: "SEO Prompt Interceptor",
    feat3Desc: "Pre-flight checklist that analyzes and enriches your prompt with placeholders, calls to action, and dynamic tags before sending it to the AI.",
    
    // Landing How it works
    howItWorksTitle: "How does the Hybrid Architecture work?",
    howItWorksSubtitle: "Smartly designed so you can automate your channels without incurring recurring cloud server or infrastructure costs.",
    step1Title: "Connect your API Key",
    step1Desc: "Add your free Google AI Studio (Gemini) key. It is securely stored encrypted only in your browser.",
    step2Title: "Run the Local Helper",
    step2Desc: "Run a command-line command on your machine to launch our local Python helper on port `4812`. It connects in real-time with our application.",
    step3Title: "Automatic Generation & Rendering",
    step3Desc: "Create and plan your videos from the AutoProd web console. Gemini AI will generate SEO metadata and send the signal to the Helper to compile local video and audio resources using your local hardware.",
    
    // Footer
    allRightsReserved: "All rights reserved.",
    harness: "Harness",
    
    // Dashboard Left Sidebar
    geminiKeyTitle: "Gemini Key (BYOK)",
    saveKeyBtn: "Save Key",
    savedKeyBtn: "🔑 Key Saved",
    channelsTitle: "Channels & Projects",
    activeTemplatesTitle: "Active Templates",
    
    // Dashboard Center Chat
    welcomeChatMsg: "Hello! I am your AutoProd Co-Pilot. Select a project and we will configure the SEO prompt or prepare the rendering.",
    interceptorTitle: "🚀 Interceptor",
    chkCta: "Include CTA",
    chkTimestamps: "Timestamps",
    chkTags: "15 SEO Tags",
    chkThumbnail: "Generate Thumbnail",
    promptPlaceholder: "Write a prompt to optimize the video...",
    sendBtn: "Send",
    
    // Dashboard Right Panel
    thumbnailTitle: "Generated Thumbnail",
    regenerateThumbnail: "Regenerate Thumbnail",
    metadataTitle: "Generated SEO Metadata",
    optTitleLabel: "Optimized Title",
    tagsLabel: "Tags",
    descLabel: "Description",
    localRenderTitle: "Local Render",
    startRenderBtn: "🎬 Start Video Rendering",
    renderingProgress: "Processing batch...",
    renderDisclaimer: "Tracks will be compiled in Resultado/ using your local CPU/GPU.",
    
    // Profile Dropdown
    myAccount: "My Account",
    configGeneral: "⚙️ General Settings",
    myInfo: "👤 My Data",
    billingPlan: "💳 Billing & Plan",
    changePassword: "🔑 Change Password",
    redirecting: "Redirecting to"
  }
};
