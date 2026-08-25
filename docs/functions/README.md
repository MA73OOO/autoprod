# 🚀 Documentación de Funciones del Sistema

## 📌 Catálogo de Funciones Principales

### 1. 🛡️ Interceptor de Prompts & Pre-flight Checklist
* **Propósito**: Pausar el envío del prompt en el chat para presentar un modal con checkboxes de calidad.
* **Componentes**:
  * Checkbox 1: Incluir llamada a la acción (Suscribirse / Like).
  * Checkbox 2: Incorporar marcas de tiempo / timestamps automáticos.
  * Checkbox 3: Generar 15 etiquetas SEO relevantes.
  * Checkbox 4: Guardar portada borrador en `miniature/`.
* **Resultado**: Combina el prompt del usuario con las plantillas maestras y envía un prompt enriquecido 100% efectivo a Gemini.

### 2. 🔑 Modelo Gemini BYOK (Bring Your Own Key)
* **Propósito**: Permitir que los usuarios usen su propia clave gratuita de Google AI Studio.
* **Costo Operativo**: $0 USD para el desarrollador.
* **Seguridad**: Almacenamiento local encriptado en el navegador/PWA.

### 3. 🎬 Generador & Renderizador de Videos Local
* **Propósito**: Concatenar pistas de audio, videos de fondo y audio ambiental.
* **Modos de Duración**:
  * Duración Natural (Suma exacta de canciones en `Musica/`).
  * Duración Fija (60 minutos en bucle).
  * Duración Personalizada.
* **Ejecución**: Agente Local Helper (`localhost:4812`) llamando a FFmpeg nativo.

### 4. 📝 Creador de Estructura de Carpetas y Configuración SEO
* Crea automáticamente la taxonomía de carpetas:
  ```text
  <Canal>/<Proyecto>/
  ├── Videos/
  ├── Musica/
  ├── Ambiente/
  ├── Resultado/
  ├── miniature/
  ├── config_subida.md
  └── comentario_fijado.md
  ```
