import 'dotenv/config';
import { db as prisma } from '../src/prisma/db';

async function main() {
  console.log('🌱 Seeding Orchestrator and Tools...');

  // ──────────────────────────────────────────────
  // 1. Definir Tools (cada una con descripción clara para que el LLM entienda cuándo usarla)
  // ──────────────────────────────────────────────

  const toolWorkspaceDefault = await prisma.tool.upsert({
    where: { name: 'workspace_default' },
    update: {
      description: 'Obtiene la ruta base del workspace de AutoProd en el sistema del usuario. Útil si el usuario pregunta dónde está trabajando o si necesitas confirmar la ubicación del workspace.',
    },
    create: {
      name: 'workspace_default',
      description: 'Obtiene la ruta base del workspace de AutoProd en el sistema del usuario. Útil si el usuario pregunta dónde está trabajando o si necesitas confirmar la ubicación del workspace.',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/default',
      method: 'GET',
      schema: { type: 'object', properties: {}, required: [] }
    }
  });

  const toolListarDirectorio = await prisma.tool.upsert({
    where: { name: 'listar_directorio' },
    update: {
      description: 'Lista el contenido (carpetas y archivos) de un directorio o canal del workspace en formato árbol jerárquico. Puedes pasar base_path, channel_name o dejarlo vacío para explorar la raíz.',
      schema: {
        type: 'object',
        properties: {
          base_path: { type: 'string', description: 'Ruta absoluta o relativa de la carpeta/canal a explorar. Opcional.' },
          channel_name: { type: 'string', description: 'Nombre del canal a explorar (ej: "FinanzasReales"). Opcional.' }
        },
        required: []
      }
    },
    create: {
      name: 'listar_directorio',
      description: 'Lista el contenido (carpetas y archivos) de un directorio o canal del workspace en formato árbol jerárquico. Puedes pasar base_path, channel_name o dejarlo vacío para explorar la raíz.',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/',
      method: 'GET',
      schema: {
        type: 'object',
        properties: {
          base_path: { type: 'string', description: 'Ruta absoluta o relativa de la carpeta/canal a explorar. Opcional.' },
          channel_name: { type: 'string', description: 'Nombre del canal a explorar (ej: "FinanzasReales"). Opcional.' }
        },
        required: []
      }
    }
  });

  const toolListarPlano = await prisma.tool.upsert({
    where: { name: 'listar_directorio_plano' },
    update: {
      description: 'Lista carpetas y archivos de un canal o directorio en formato PLANO (sin anidamiento). Devuelve el nombre EXACTO (con tildes y mayúsculas tal como están en disco) y la ruta absoluta de cada elemento. USA ESTA HERRAMIENTA SIEMPRE para conocer la estructura real o ANTES de eliminar, mover o renombrar carpetas.',
      schema: {
        type: 'object',
        properties: {
          base_path: { type: 'string', description: 'Ruta absoluta o relativa de la carpeta o canal a listar. Opcional.' },
          channel_name: { type: 'string', description: 'Nombre opcional del canal a listar (ejemplo: "FinanzasReales").' },
          depth: { type: 'number', description: 'Profundidad de búsqueda. Usa 1 para ver solo el nivel inmediato, 2 para dos niveles. Por defecto: 2.' }
        },
        required: []
      }
    },
    create: {
      name: 'listar_directorio_plano',
      description: 'Lista carpetas y archivos de un canal o directorio en formato PLANO (sin anidamiento). Devuelve el nombre EXACTO (con tildes y mayúsculas tal como están en disco) y la ruta absoluta de cada elemento. USA ESTA HERRAMIENTA SIEMPRE para conocer la estructura real o ANTES de eliminar, mover o renombrar carpetas.',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/list_flat',
      method: 'GET',
      schema: {
        type: 'object',
        properties: {
          base_path: { type: 'string', description: 'Ruta absoluta o relativa de la carpeta o canal a listar. Opcional.' },
          channel_name: { type: 'string', description: 'Nombre opcional del canal a listar (ejemplo: "FinanzasReales").' },
          depth: { type: 'number', description: 'Profundidad de búsqueda. Usa 1 para ver solo el nivel inmediato, 2 para dos niveles. Por defecto: 2.' }
        },
        required: []
      }
    }
  });

  const toolCrearCarpetas = await prisma.tool.upsert({
    where: { name: 'crear_carpetas' },
    update: {
      description: 'Crea una o múltiples carpetas dentro del workspace o de un canal. Puedes crear una carpeta individual ("folder_name"), múltiples carpetas hermanas ("folders: [\"Videos\", \"Guiones\"]"), o un canal nuevo ("channel_name"). Opcionalmente puedes especificar "subfolders".',
      schema: {
        type: 'object',
        properties: {
          folder_name: { type: 'string', description: 'Nombre de una carpeta individual a crear.' },
          folders: { type: 'array', items: { type: 'string' }, description: 'Lista de nombres de carpetas a crear juntas (ej: ["Videos", "Guiones", "Miniaturas"]).' },
          channel_name: { type: 'string', description: 'Nombre del canal al que pertenecen las carpetas (ej: "FinanzasReales"). Si no se indica target_path, se crearán dentro de este canal.' },
          target_path: { type: 'string', description: 'Ruta padre donde se crearán las carpetas. Opcional.' },
          paths: { type: 'array', items: { type: 'string' }, description: 'Lista de rutas directas para crear.' },
          subfolders: { type: 'array', items: { type: 'string' }, description: 'Lista opcional de subcarpetas a crear dentro de cada carpeta creada.' }
        },
        required: []
      }
    },
    create: {
      name: 'crear_carpetas',
      description: 'Crea una o múltiples carpetas dentro del workspace o de un canal. Puedes crear una carpeta individual ("folder_name"), múltiples carpetas hermanas ("folders: [\"Videos\", \"Guiones\"]"), o un canal nuevo ("channel_name"). Opcionalmente puedes especificar "subfolders".',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/create',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          folder_name: { type: 'string', description: 'Nombre de una carpeta individual a crear.' },
          folders: { type: 'array', items: { type: 'string' }, description: 'Lista de nombres de carpetas a crear juntas (ej: ["Videos", "Guiones", "Miniaturas"]).' },
          channel_name: { type: 'string', description: 'Nombre del canal al que pertenecen las carpetas (ej: "FinanzasReales"). Si no se indica target_path, se crearán dentro de este canal.' },
          target_path: { type: 'string', description: 'Ruta padre donde se crearán las carpetas. Opcional.' },
          paths: { type: 'array', items: { type: 'string' }, description: 'Lista de rutas directas para crear.' },
          subfolders: { type: 'array', items: { type: 'string' }, description: 'Lista opcional de subcarpetas a crear dentro de cada carpeta creada.' }
        },
        required: []
      }
    }
  });

  const toolLeerArchivo = await prisma.tool.upsert({
    where: { name: 'leer_archivo' },
    update: {
      description: 'Lee y devuelve el contenido de un archivo .md o .txt del workspace. Úsala cuando necesites consultar información guardada en un archivo.',
    },
    create: {
      name: 'leer_archivo',
      description: 'Lee y devuelve el contenido de un archivo .md o .txt del workspace. Úsala cuando necesites consultar información guardada en un archivo.',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/file',
      method: 'GET',
      schema: {
        type: 'object',
        properties: { path: { type: 'string', description: 'Ruta absoluta del archivo a leer.' } },
        required: ['path']
      }
    }
  });

  const toolGuardarArchivo = await prisma.tool.upsert({
    where: { name: 'guardar_archivo' },
    update: {
      description: 'Guarda o crea un archivo .md o .txt en el workspace con el contenido que le pases. Úsala cuando necesites escribir o actualizar un archivo.',
      schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Nombre o ruta del archivo a guardar (ejemplo: "investigacion.md" o "carpeta/investigacion.md"). Si es relativa se guardará dentro de tu workspace.' },
          content: { type: 'string', description: 'El contenido de texto a guardar en el archivo.' }
        },
        required: ['path', 'content']
      }
    },
    create: {
      name: 'guardar_archivo',
      description: 'Guarda o crea un archivo .md o .txt en el workspace con el contenido que le pases. Úsala cuando necesites escribir o actualizar un archivo.',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/file',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Nombre o ruta del archivo a guardar (ejemplo: "investigacion.md" o "carpeta/investigacion.md"). Si es relativa se guardará dentro de tu workspace.' },
          content: { type: 'string', description: 'El contenido de texto a guardar en el archivo.' }
        },
        required: ['path', 'content']
      }
    }
  });

  const toolVerificarEstado = await prisma.tool.upsert({
    where: { name: 'verificar_estado_sistema' },
    update: {
      description: 'Verifica si el sistema del usuario tiene las dependencias necesarias instaladas (Python, FFmpeg, yt-dlp, etc.). Úsala si el usuario pregunta si su sistema está listo o antes de tareas que requieran estas herramientas.',
    },
    create: {
      name: 'verificar_estado_sistema',
      description: 'Verifica si el sistema del usuario tiene las dependencias necesarias instaladas (Python, FFmpeg, yt-dlp, etc.). Úsala si el usuario pregunta si su sistema está listo o antes de tareas que requieran estas herramientas.',
      apiEndpoint: 'http://localhost:3000/api/tools/estado_sistema',
      method: 'POST',
      schema: { type: 'object', properties: {}, required: [] }
    }
  });

  const toolGenerarInfoCanal = await prisma.tool.upsert({
    where: { name: 'generar_info_canal' },
    update: {
      description: 'Crea un nuevo canal de YouTube: genera la carpeta del canal y el archivo config_canal.md con la guía de marca e identidad visual generada por IA. Úsala cuando el usuario quiera crear un canal nuevo.',
    },
    create: {
      name: 'generar_info_canal',
      description: 'Crea un nuevo canal de YouTube: genera la carpeta del canal y el archivo config_canal.md con la guía de marca e identidad visual generada por IA. Úsala cuando el usuario quiera crear un canal nuevo.',
      apiEndpoint: 'http://localhost:3000/api/tools/generar_info_canal',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          nombre_canal: { type: 'string', description: 'Nombre del canal a crear.' },
          contexto_del_usuario: { type: 'string', description: 'Temática, estilo y peticiones del usuario para este canal.' }
        },
        required: ['nombre_canal', 'contexto_del_usuario']
      }
    }
  });

  const toolGenerarMetadatosSubida = await prisma.tool.upsert({
    where: { name: 'generar_metadatos_subida' },
    update: {
      description: 'Crea un nuevo video dentro de un canal: genera toda la estructura de carpetas (Guiones, Videos, Imagenes, etc.) y los archivos config_video.md y comentario_fijado.md con metadatos SEO generados por IA. Úsala cuando el usuario quiera crear o preparar un video nuevo.',
    },
    create: {
      name: 'generar_metadatos_subida',
      description: 'Crea un nuevo video dentro de un canal: genera toda la estructura de carpetas (Guiones, Videos, Imagenes, etc.) y los archivos config_video.md y comentario_fijado.md con metadatos SEO generados por IA. Úsala cuando el usuario quiera crear o preparar un video nuevo.',
      apiEndpoint: 'http://localhost:3000/api/tools/generar_metadatos_subida',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          nombre_canal: { type: 'string', description: 'Nombre del canal donde va el video.' },
          nombre_video: { type: 'string', description: 'Nombre del video (se usará como nombre de carpeta).' },
          tematica: { type: 'string', description: 'Temática o tema específico del video.' },
          contexto_del_usuario: { type: 'string', description: 'Indicaciones, estilo y requisitos del usuario para los metadatos.' }
        },
        required: ['nombre_canal', 'nombre_video', 'tematica', 'contexto_del_usuario']
      }
    }
  });

  const toolExtraerCanal = await prisma.tool.upsert({
    where: { name: 'extraer_canal_youtube' },
    update: {
      description: 'Extrae la información completa de un canal de YouTube usando su URL o @handle. Analiza los videos previos, extrae etiquetas ganadoras (tags), genera el catálogo de temas ya cubiertos para no duplicar ideas, indexa el vector de contexto en la base de datos y crea la carpeta InfoCanal en el disco del usuario con Contexto_canal.md, Metricas_canal.md e Historial_canal.md.',
      schema: {
        type: 'object',
        properties: {
          url_canal: { type: 'string', description: 'URL completa o @handle del canal de YouTube (ej: "https://www.youtube.com/@PawsAndPillows" o "@PawsAndPillows").' },
          max_videos: { type: 'number', description: 'Cantidad máxima de videos a extraer y analizar (por defecto: 50).' }
        },
        required: ['url_canal']
      }
    },
    create: {
      name: 'extraer_canal_youtube',
      description: 'Extrae la información completa de un canal de YouTube usando su URL o @handle. Analiza los videos previos, extrae etiquetas ganadoras (tags), genera el catálogo de temas ya cubiertos para no duplicar ideas, indexa el vector de contexto en la base de datos y crea la carpeta InfoCanal en el disco del usuario con Contexto_canal.md, Metricas_canal.md e Historial_canal.md.',
      apiEndpoint: 'http://localhost:3000/api/tools/extraer_canal_youtube',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          url_canal: { type: 'string', description: 'URL completa o @handle del canal de YouTube (ej: "https://www.youtube.com/@PawsAndPillows" o "@PawsAndPillows").' },
          max_videos: { type: 'number', description: 'Cantidad máxima de videos a extraer y analizar (por defecto: 50).' }
        },
        required: ['url_canal']
      }
    }
  });

  const toolEliminarCarpetas = await prisma.tool.upsert({
    where: { name: 'eliminar_carpetas' },
    update: {
      description: 'Elimina una o múltiples carpetas del workspace de forma permanente junto con todo su contenido (compatible con macOS y Windows). Puedes pasar "channel_name" y "folder_name" (o "folders: [...]"), o pasar directamente "ruta" o "paths: [...]".',
      schema: {
        type: 'object',
        properties: {
          channel_name: {
            type: 'string',
            description: 'Nombre del canal donde se encuentra la carpeta a eliminar (ej: "FinanzasReales"). Opcional si pasas ruta completa.'
          },
          folder_name: {
            type: 'string',
            description: 'Nombre de una sola carpeta a eliminar dentro del canal (ej: "Videos").'
          },
          folders: {
            type: 'array',
            items: { type: 'string' },
            description: 'Lista de nombres de múltiples carpetas a eliminar dentro del canal (ej: ["Videos", "Guiones"]).'
          },
          ruta: {
            type: 'string',
            description: 'La ruta completa o relativa de la carpeta a eliminar (ej: "FinanzasReales/Videos").'
          },
          paths: {
            type: 'array',
            items: { type: 'string' },
            description: 'Lista de rutas de múltiples carpetas a eliminar a la vez (ej: ["FinanzasReales/Videos", "FinanzasReales/Guiones"]).'
          }
        },
        required: []
      }
    },
    create: {
      name: 'eliminar_carpetas',
      description: 'Elimina una o múltiples carpetas del workspace de forma permanente junto con todo su contenido (compatible con macOS y Windows). Puedes pasar "channel_name" y "folder_name" (o "folders: [...]"), o pasar directamente "ruta" o "paths: [...]".',
      apiEndpoint: 'http://127.0.0.1:8000/workspace/delete_folder',
      method: 'POST',
      schema: {
        type: 'object',
        properties: {
          channel_name: {
            type: 'string',
            description: 'Nombre del canal donde se encuentra la carpeta a eliminar (ej: "FinanzasReales"). Opcional si pasas ruta completa.'
          },
          folder_name: {
            type: 'string',
            description: 'Nombre de una sola carpeta a eliminar dentro del canal (ej: "Videos").'
          },
          folders: {
            type: 'array',
            items: { type: 'string' },
            description: 'Lista de nombres de múltiples carpetas a eliminar dentro del canal (ej: ["Videos", "Guiones"]).'
          },
          ruta: {
            type: 'string',
            description: 'La ruta completa o relativa de la carpeta a eliminar (ej: "FinanzasReales/Videos").'
          },
          paths: {
            type: 'array',
            items: { type: 'string' },
            description: 'Lista de rutas de múltiples carpetas a eliminar a la vez (ej: ["FinanzasReales/Videos", "FinanzasReales/Guiones"]).'
          }
        },
        required: []
      }
    }
  });

  // ──────────────────────────────────────────────
  // 2. System Prompt del Orquestador
  //    Nota: {workspace_path} se reemplaza dinámicamente en route.ts
  // ──────────────────────────────────────────────

  const orchestratorSystemPrompt = `Eres AutoProd, un asistente de IA de élite especializado en la producción y automatización de canales de YouTube.

ROL Y COMUNICACIÓN CON EL USUARIO:
- Te comunicas como un productor de contenido profesional, proactivo y resolutivo.
- El usuario habla de "Canales", "Workspace", "Videos" y "Carpetas de recursos" (como Guiones, Miniaturas, Videos, etc.).
- NUNCA expongas al cliente rutas técnicas de disco (ej: "E:/AutoProdAI/youtube/...", "C:\\...", barras diagonales ni mensajes de error de sistema de archivos).
- Si realizas una acción, confírmasela amablemente en términos de su proyecto (ej: "He eliminado la carpeta Videos de tu canal FinanzasReales. Tu espacio de trabajo está listo.").

MAPEO DEL WORKSPACE Y CANALES:
- Tu workspace activo es la carpeta raíz: {workspace_path}
- Cada CANAL es una carpeta principal dentro de tu workspace ({workspace_path}/NombreCanal).
- Los contenidos de un canal (Videos, Guiones, etc.) son subcarpetas dentro de dicho canal.
- Si el usuario menciona "carpeta 1" o el "canal 1", mapealo al canal correspondiente de la lista según el orden en que se exploraron.

HERRAMIENTAS DE GESTIÓN (CRUD):
- "listar_directorio_plano": Devuelve la lista exacta de carpetas y archivos en disco. Úsala SIEMPRE que necesites conocer la estructura o antes de crear/eliminar si no estás seguro del contenido.
- "listar_directorio": Devuelve el árbol jerárquico.
- "crear_carpetas": Crea carpetas individuales o múltiples. Puedes pasar:
  * "channel_name" y "folders: ['Videos', 'Guiones']" para crear varias carpetas en un canal a la vez.
  * "channel_name" y "folder_name: 'Videos'" para una sola carpeta.
  * O simplemente "channel_name: 'NuevoCanal'" para crear un canal nuevo.
- "eliminar_carpetas": Elimina carpetas individuales o múltiples. Puedes pasar:
  * "channel_name" y "folder_name: 'Videos'" para eliminar una carpeta de un canal.
  * "channel_name" y "folders: ['Videos', 'Guiones']" para eliminar varias carpetas de un canal a la vez.
  * O "paths: ['...']" con las rutas que obtengas de listar_directorio_plano.
- "extraer_canal_youtube": Extrae un canal de YouTube usando su URL o @handle. Minará las etiquetas ganadoras, el historial de videos para no duplicar ideas y creará la carpeta InfoCanal en el workspace.

EXPLICACIÓN DE EXTRACCIÓN DE CANALES:
- Si el usuario te pregunta qué harás con la URL de YouTube, qué pasará en su espacio de trabajo o cómo funciona la extracción:
  1. Explícaselo de forma muy clara y visual utilizando un diagrama de árbol de carpetas Markdown.
  2. Menciona sus canales existentes como referencia (por ejemplo, si ves "FinanzasReales" en su workspace, úsalo de ejemplo).
  3. Muestra el diagrama exacto:
\`\`\`text
/Workspace
├── /FinanzasReales (Tu canal actual)
└── /NombreCanal (Nuevo canal traído desde YouTube)
    ├── /InfoCanal
    │   ├── Contexto_canal.md    # Identidad, nicho y audiencia
    │   ├── Metricas_canal.md    # Ranking de etiquetas (tags) comprobadas
    │   └── Historial_canal.md   # Catálogo anti-duplicados de videos
    └── /Futuras_Carpetas_de_Videos (Creadas sin repetir ideas)
\`\`\`
  4. Resalta los dos beneficios clave:
     • 🚫 CERO IDEAS REPETIDAS: Usaremos Historial_canal.md como filtro para no duplicar ningún tema que ya haya publicado.
     • 📈 APROVECHAR LO QUE FUNCIONÓ: Minaremos las etiquetas y fórmulas de títulos con mayor volumen de reproducciones para incorporarlas en los nuevos videos.

REGLAS CRÍTICAS:
- NUNCA llames a "eliminar_carpetas" ni a "crear_carpetas" con argumentos vacíos {}. Especifica siempre al menos el canal y las carpetas.
- PRIORIZA SIEMPRE la ejecución de herramientas sobre responder solo con texto cuando el usuario te pida una acción.
- Responde siempre con un mensaje claro y amigable al finalizar la ejecución de las herramientas.

=== PRESENTACIÓN DE CAPACIDADES (PRODUCCIÓN ESTRATÉGICA E INTELIGENTE) ===
- Cuando el usuario pregunte en qué puedes ayudar o qué puedes hacer, responde como un Director Ejecutivo de Contenido con una estructura modular, visual y limpia, adaptada a sus canales reales y sus nichos.`;

  // ──────────────────────────────────────────────
  // 3. Crear/Actualizar Agente Orquestador
  // ──────────────────────────────────────────────

  const orchestrator = await prisma.agent.upsert({
    where: { slug: 'orchestrator' },
    update: {
      systemPrompt: orchestratorSystemPrompt
    },
    create: {
      name: 'AutoProd Orchestrator',
      slug: 'orchestrator',
      description: 'El agente principal que interactúa con el usuario, maneja contexto y delega trabajo.',
      systemPrompt: orchestratorSystemPrompt
    }
  });

  // ──────────────────────────────────────────────
  // 4. Vincular Tools al Orquestador
  // ──────────────────────────────────────────────

  const allTools = [
    toolWorkspaceDefault,
    toolListarDirectorio,
    toolListarPlano,
    toolCrearCarpetas,
    toolEliminarCarpetas,
    toolLeerArchivo,
    toolGuardarArchivo,
    toolVerificarEstado,
    toolGenerarInfoCanal,
    toolGenerarMetadatosSubida,
    toolExtraerCanal,
  ];

  for (const tool of allTools) {
    await prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: orchestrator.id, toolId: tool.id } },
      update: {},
      create: { agentId: orchestrator.id, toolId: tool.id }
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
