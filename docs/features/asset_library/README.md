# 🗃️ Biblioteca de Recursos (Asset Library & CRUD)

## 📌 Qué hace
Es el panel centralizado y gestor de activos multimedia de AutoProd. Permite a los creadores de contenido visualizar, indexar, gestionar y realizar operaciones CRUD completas sobre todos los recursos vinculados a sus canales y producciones:
1. **Catálogo Unificado:** Muestra imágenes generadas con DALL-E, miniaturas de YouTube, transcripciones de subtítulos de Whisper (`.srt`, `.vtt`), videos procesados por el Video Looper y pistas de audio.
2. **Doble Modo de Visualización:** Cuadrícula visual interactiva (cards con previsualizadores) y tabla detallada con ordenamiento por tamaño, fecha, canal y formato.
3. **Control de Almacenamiento Híbrido:**
   - **Local:** Archivos que residen directamente en el disco duro del usuario (`[workspace]/[canal]/...`).
   - **Nube:** Archivos respaldados en Supabase Cloud Storage.
   - **Dual:** Archivos con persistencia física local y copia de seguridad en la nube sincronizada.
4. **Sincronización Inteligente de Disco Local:** Si la base de datos está vacía o el usuario pulsa *"Sincronizar Disco Local"*, el motor de Python escanea el disco físico, detecta automáticamente medios existentes en las carpetas del canal y los indexa en la base de datos sin duplicados.
5. **Acciones de Alta Productividad:**
   - **Copiar Ruta Local (`Copiar Path`):** Copia la ruta absoluta de Windows/macOS en 1 clic para arrastrar o importar directamente a CapCut, DaVinci Resolve o Adobe Premiere.
   - **Previsualizador Multimodal:** Modal lightbox para imágenes con prompt usado, visor interactivo de subtítulos `.srt` con marcas de tiempo, y reproductor de video nativo.
   - **Abrir en Explorador:** Abre la carpeta física del archivo en el Explorador de Windows o Finder de macOS.
   - **Respaldar en la Nube:** Sube un archivo local a Supabase Storage con un solo clic.
   - **Eliminación Segura:** Permite eliminar el recurso de la base de datos y, opcionalmente, purgar también el archivo físico del disco local.

---

## 🛠️ Cómo lo hace

1. **Modelo Relacional en Prisma (`prisma/schema.prisma` y `src/prisma/contract.prisma`):**
   - Tabla `asset`:
     - `id`: UUID clave primaria.
     - `userId`: Clave foránea hacia `user`.
     - `channelId`: Clave foránea opcional hacia `channel`.
     - `name`: Nombre del archivo.
     - `type`: `IMAGE` | `THUMBNAIL` | `SUBTITLE` | `VIDEO` | `AUDIO` | `OTHER`.
     - `format`: Extensión normalizada (`png`, `srt`, `mp4`, etc.).
     - `prompt`: Prompt textual utilizado para la generación con IA.
     - `storageUrl`: URL pública en Supabase Storage (bucket `assets`).
     - `localPath`: Ruta física absoluta en el disco del usuario.
     - `sizeBytes`: Tamaño exacto del archivo en bytes.
     - `metadata`: Objeto JSON con resolución, duración, parámetros de motor, etc.
2. **Escaneo y Detección Local en Motor Python (`controlador/routers/workspace.py`):**
   - **`POST /workspace/scan_media`:** Recorre recursivamente las carpetas del canal o workspace, clasificando archivos por extensión y directorio (ej: si está en `Miniaturas/` se cataloga como `THUMBNAIL`), extrayendo fecha de modificación y peso en bytes.
   - **`POST /workspace/delete_file`:** Elimina de forma segura un archivo individual del sistema de archivos local.
   - **`POST /workspace/open_folder`:** Ejecuta `explorer.exe /select,"<ruta>"` en Windows o `open -R` en macOS para mostrar el archivo resaltado en su carpeta.
3. **Rutas de API en Next.js (`app/api/assets/...`):**
   - **`GET /api/assets`:** Lista los recursos filtrados por `type`, `channelId` y búsqueda de texto. Calcula el almacenamiento total en la nube y porcentaje respecto a la cuota base (500 MB).
   - **`POST /api/assets`:** Registra un nuevo asset en la base de datos.
   - **`PATCH /api/assets/[id]`:** Permite renombrar y reasignar canales.
   - **`DELETE /api/assets/[id]`:** Borra de la BD, del bucket de Supabase Storage y, si `?deleteLocal=true`, invoca el endpoint local de Python para borrarlo del disco.
   - **`POST /api/assets/scan-local`:** Orquesta el escaneo con el motor Python e inserta en la BD los archivos no indexados.
   - **`POST /api/assets/[id]/upload-to-cloud`:** Lee el archivo local, lo sube a Supabase Storage y actualiza el campo `storageUrl`.
4. **Interfaz React (`components/dashboard/AssetLibraryView.tsx`):**
   - Barra superior con medidor de cuota de almacenamiento en la nube en tiempo real.
   - Pestañas de categoría con conteo de elementos.
   - Alternador de vista cuadrícula (cards) y vista tabla.
   - Modales interactivos para previsualización, edición y confirmación de borrado.

---

## 📂 Archivos involucrados

- `prisma/schema.prisma` -> Definición del modelo `Asset` con índices y relaciones.
- `src/prisma/contract.prisma` -> Sincronización del contrato de datos.
- `controlador/routers/workspace.py` -> Endpoints `scan_media`, `delete_file`, `open_folder` y `save_binary_file`.
- `lib/controlador-client.ts` -> Métodos TypeScript `scanMedia`, `deleteFile`, `openFolder`, `saveBinaryFile`.
- `app/api/assets/route.ts` -> API GET y POST de recursos con cálculo de cuotas.
- `app/api/assets/[id]/route.ts` -> API PATCH y DELETE con soporte de purga local.
- `app/api/assets/scan-local/route.ts` -> API de auto-indexación desde disco local.
- `app/api/assets/[id]/upload-to-cloud/route.ts` -> API de respaldo a Supabase Storage.
- `components/dashboard/AssetLibraryView.tsx` -> Componente de interfaz de usuario de la biblioteca de recursos.
- `components/dashboard/ConversationSidebar.tsx` -> Acceso directo con botón `🗃️ Biblioteca de Recursos`.
- `components/dashboard/Launchpad.tsx` -> Tarjeta de acceso en la consola principal.
- `app/dashboard/page.tsx` -> Enrutamiento de vista `activeView === 'assets'`.

---

## 🎯 Propósito
Garantizar al creador el control absoluto sobre sus recursos multimedia tanto localmente como en la nube, facilitando el reuso instantáneo de miniaturas, subtítulos y videos en herramientas externas de edición (CapCut, Premiere) y eliminando el trabajo manual de organización de archivos.
