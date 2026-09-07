# 🎨 Creador de Imágenes & Miniaturas IA (Image Studio)

## 📌 Qué hace
Es el estudio multimodal especializado en la creación de miniaturas de YouTube de alta conversión (16:9), fondos animados para bucles de video y artes visuales (Shorts 9:16 o Cuadrado 1:1). Integra:
1. **Flujo con Imagen de Referencia (Visión Artificial + Co-Pilot):**
   - El usuario pega (`Ctrl+V`) o sube una imagen de referencia.
   - La IA (GPT-4o Vision) desglosa técnicamente el estilo artístico, la paleta cromática, la iluminación y el encuadre.
   - Formula 3 preguntas guiadas de adaptación (*¿Qué sujeto o personaje principal deseas? ¿Deseas mantener esta misma paleta de colores? ¿Qué emoción o gancho de miniatura quieres destacar?*).
2. **Flujo Guiado sin Imagen de Referencia (Prompt Questionnaire):**
   - Cuestionario visual interactivo paso a paso: Objetivo de aspecto, estilos preconfigurados (Anime Ghibli, 3D Pixar, Hiperrealista, Cyberpunk, etc.), sujeto central, emoción y paleta de colores.
   - Construye automáticamente un prompt maestro ultra optimizado en inglés para DALL-E 3.
3. **Generación con DALL-E 3 y Persistencia Dual:**
   - Genera imágenes de alta definición con OpenAI DALL-E 3.
   - Guarda físicamente el archivo `.png` en el disco local del cliente (`[workspace]/[canal]/Miniaturas/` o `Imagenes/`) mediante el motor Python.
   - Sube la imagen a Supabase Cloud Storage y la indexa de forma automática en la tabla `Asset` de la base de datos para que aparezca al instante en la Biblioteca de Recursos.

---

## 🛠️ Cómo lo hace

1. **Análisis Multimodal (`app/api/images/analyze/route.ts`):**
   - Recibe la imagen en base64.
   - Envía a OpenAI con `model: 'gpt-4o-mini'` y rol de Director de Arte para miniaturas de YouTube.
   - Devuelve un JSON estructurado con `style`, `lighting`, `palette`, `composition`, `suggestedQuestions` y un `draftPrompt` base.
2. **Generación y Guardado Dual (`app/api/images/generate/route.ts`):**
   - Llama a `https://api.openai.com/v1/images/generations` con modelo `dall-e-3`, `quality: 'standard'` y resolución de aspecto (`1792x1024` para 16:9, `1024x1792` para 9:16, `1024x1024` para 1:1).
   - Recibe `b64_json` para tener los bytes reales de inmediato sin enlaces temporales que expiren.
   - **Guardado Local:** Invoca `POST http://127.0.0.1:8000/workspace/save_binary_file` enviando los bytes para que el motor de Python cree el archivo en la subcarpeta del canal en disco duro.
   - **Guardado en Nube:** Sube el buffer de imagen a Supabase Storage (bucket `assets`).
   - **Registro Relacional:** Inserta un registro en `Asset` con `userId`, `channelId`, `name`, `localPath`, `storageUrl`, `prompt`, `metadata.aspectRatio` y `metadata.engine: 'dall-e-3'`.
3. **Interfaz de Usuario (`components/dashboard/ImageStudio.tsx`):**
   - Selector de modo: *Con Imagen de Referencia* vs *Cuestionario Guiado*.
   - Zona de dropzone con captura de evento `paste` (`Ctrl+V`).
   - Diagnóstico visual en tiempo real y formulario interactivo de preguntas.
   - Columna de resultado con previsualizador, copia de ruta local en 1 clic y enlace directo a la Biblioteca de Recursos.

---

## 📂 Archivos involucrados

- `app/api/images/analyze/route.ts` -> Endpoint para desglose visual de referencias y formulación de preguntas.
- `app/api/images/generate/route.ts` -> Endpoint de generación con DALL-E 3, guardado en disco vía motor y subida a Supabase.
- `controlador/routers/workspace.py` -> Endpoint `save_binary_file` en FastAPI para escritura física de bytes en disco.
- `components/dashboard/ImageStudio.tsx` -> Estudio interactivo de creación de imágenes y miniaturas.
- `components/dashboard/ConversationSidebar.tsx` -> Botón de acceso directo `🎨 Creador de Imágenes`.
- `components/dashboard/Launchpad.tsx` -> Tarjeta `Crear Imágenes & Miniaturas` en la consola de inicio.
- `app/dashboard/page.tsx` -> Enrutamiento de vista `activeView === 'images'`.

---

## 🎯 Propósito
Proveer a los creadores de una herramienta integral de dirección de arte asistida por IA para miniaturas y fondos de video que garantice coherencia estética, alta tasa de clics (CTR) y disponibilidad inmediata de los archivos en su flujo de edición local sin fricción.
