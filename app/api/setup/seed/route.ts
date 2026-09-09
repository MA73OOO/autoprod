import { NextResponse } from 'next/server';
import { db as prisma } from '@/src/prisma/db';

export async function GET() {
  try {
    const toolWorkspaceDefault = await prisma.tool.upsert({
      where: { name: 'workspace_default' },
      update: {
        description: 'Obtiene la ruta base del workspace de AutoProd en el sistema del usuario.',
      },
      create: {
        name: 'workspace_default',
        description: 'Obtiene la ruta base del workspace de AutoProd en el sistema del usuario.',
        apiEndpoint: 'http://127.0.0.1:8000/workspace/default',
        method: 'GET',
        schema: { type: 'object', properties: {}, required: [] }
      }
    });

    const toolListarDirectorio = await prisma.tool.upsert({
      where: { name: 'listar_directorio' },
      update: {
        description: 'Lista el contenido de un directorio del workspace.',
      },
      create: {
        name: 'listar_directorio',
        description: 'Lista el contenido de un directorio del workspace.',
        apiEndpoint: 'http://127.0.0.1:8000/workspace/',
        method: 'GET',
        schema: {
          type: 'object',
          properties: {
            base_path: { type: 'string', description: 'La ruta absoluta de la carpeta que deseas explorar.' }
          },
          required: ['base_path']
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

    const toolLeerArchivo = await prisma.tool.upsert({
      where: { name: 'leer_archivo' },
      update: {
        description: 'Lee y devuelve el contenido de un archivo .md o .txt del workspace.',
      },
      create: {
        name: 'leer_archivo',
        description: 'Lee y devuelve el contenido de un archivo .md o .txt del workspace.',
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
        description: 'Guarda o crea un archivo .md o .txt en el workspace con el contenido que le pases.',
        apiEndpoint: 'http://127.0.0.1:8000/workspace/file',
        method: 'POST',
        schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Nombre o ruta del archivo a guardar (ejemplo: "investigacion.md" o "carpeta/investigacion.md").' },
            content: { type: 'string', description: 'El contenido de texto a guardar en el archivo.' }
          },
          required: ['path', 'content']
        }
      }
    });

    const toolVerificarEstado = await prisma.tool.upsert({
      where: { name: 'verificar_estado_sistema' },
      update: { description: 'Verifica si el sistema del usuario tiene las dependencias necesarias instaladas.' },
      create: {
        name: 'verificar_estado_sistema',
        description: 'Verifica si el sistema del usuario tiene las dependencias necesarias instaladas.',
        apiEndpoint: 'http://localhost:3000/api/tools/estado_sistema',
        method: 'POST',
        schema: { type: 'object', properties: {}, required: [] }
      }
    });

    const toolGenerarInfoCanal = await prisma.tool.upsert({
      where: { name: 'generar_info_canal' },
      update: { description: 'Crea un nuevo canal de YouTube y genera config_canal.md.' },
      create: {
        name: 'generar_info_canal',
        description: 'Crea un nuevo canal de YouTube y genera config_canal.md.',
        apiEndpoint: 'http://localhost:3000/api/tools/generar_info_canal',
        method: 'POST',
        schema: {
          type: 'object',
          properties: {
            nombre_canal: { type: 'string', description: 'Nombre del canal a crear.' },
            contexto_del_usuario: { type: 'string', description: 'Temática del canal.' }
          },
          required: ['nombre_canal', 'contexto_del_usuario']
        }
      }
    });

    const toolCrearCanal = await prisma.tool.upsert({
      where: { name: 'crear_canal' },
      update: { description: 'Crea e inicializa un nuevo canal de YouTube con su carpeta InfoCanal/ y sus 4 archivos esenciales de memoria.' },
      create: {
        name: 'crear_canal',
        description: 'Crea e inicializa un nuevo canal de YouTube con su carpeta InfoCanal/ y sus 4 archivos esenciales de memoria.',
        apiEndpoint: 'http://localhost:3000/api/tools/crear_canal',
        method: 'POST',
        schema: {
          type: 'object',
          properties: {
            nombre_canal: { type: 'string', description: 'Nombre del canal.' },
            tematica: { type: 'string', description: 'Nicho temático del canal.' },
            estilo_tono: { type: 'string', description: 'Tono o estilo (opcional).' },
            audiencia: { type: 'string', description: 'Audiencia objetivo (opcional).' }
          },
          required: ['nombre_canal', 'tematica']
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

    const orchestratorSystemPrompt = `Eres AutoProd, un asistente de IA especializado en la producción de contenido para YouTube.

CONTEXTO DE TRABAJO Y WORKSPACE:
- Tu workspace activo es la carpeta raíz: {workspace_path}
- Todas las carpetas de canales (ej: finanzasReales) y sus contenidos residen dentro de {workspace_path}.
- Cuando necesites leer, crear, modificar o eliminar archivos o carpetas, construye la ruta considerando la jerarquía del canal (ejemplo: "{workspace_path}/finanzasReales/Imágenes" o "finanzasReales/Imágenes").
- Si no estás seguro de la ubicación exacta de una subcarpeta dentro del canal o video, usa primero "listar_directorio" para explorar la jerarquía del workspace antes de intentar modificarla o eliminarla.

FLUJO DE TRABAJO:
1. Analiza lo que el usuario necesita.
2. Revisa las herramientas que tienes disponibles en tu contexto.
3. Si alguna herramienta resuelve la tarea, ejecútala PRIMERO. Después complementa con texto si es necesario.
4. Si te faltan datos o necesitas confirmar la estructura de subcarpetas de un canal, usa "listar_directorio".
5. Cuando la herramienta te devuelva un resultado, resúmelo al usuario de forma clara.

REGLAS:
- Si el usuario pregunta qué puedes hacer o en qué puedes ayudar, responde con la estructura ejecutiva de AutoProd adaptada a sus canales reales (Estrategia, Video Looper PRO, Estudio Creativo & Miniaturas, Inteligencia de YouTube y Workspace).

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
     • 📈 APROVECHAR LO QUE FUNCIONÓ: Minaremos las etiquetas y fórmulas de títulos con mayor volumen de reproducciones para incorporarlas en los nuevos videos.`;

    const orchestrator = await prisma.agent.upsert({
      where: { slug: 'orchestrator' },
      update: { systemPrompt: orchestratorSystemPrompt },
      create: {
        name: 'AutoProd Orchestrator',
        slug: 'orchestrator',
        description: 'El agente principal que interactúa con el usuario, maneja contexto y delega trabajo.',
        systemPrompt: orchestratorSystemPrompt
      }
    });

    if (orchestrator) {
      const allTools = [
        toolWorkspaceDefault,
        toolListarDirectorio,
        toolCrearCarpetas,
        toolEliminarCarpetas,
        toolLeerArchivo,
        toolGuardarArchivo,
        toolVerificarEstado,
        toolGenerarInfoCanal,
        toolCrearCanal,
        toolExtraerCanal,
      ];

      for (const tool of allTools) {
        await prisma.agentTool.upsert({
          where: { agentId_toolId: { agentId: orchestrator.id, toolId: tool.id } },
          update: {},
          create: { agentId: orchestrator.id, toolId: tool.id }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Orchestrator tools seeded successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
