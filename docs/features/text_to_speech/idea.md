# 💡 Idea & Escalabilidad: Text-to-Speech Multi-Motor (Locución & Voz en Off)

> **Ruta:** `docs/features/text_to_speech/idea.md`  
> **Propósito:** Generar narraciones profesionales para videos a partir de guiones o ideas, ofreciendo tanto una opción gratuita ilimitada local para experimentación sin fricción, como modelos de alta fidelidad con gobernanza clara de créditos.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** El proceso tradicional de locución es uno de los mayores cuellos de botella para los creadores de canales automatizados o temáticos. Contratar locutores es costoso y lento; pagar APIs como ElevenLabs desde el día 1 representa una barrera de entrada prohibitiva para creadores que están validando un canal nuevo o iterando guiones. Por otro lado, obligar al usuario a usar únicamente modelos de pago genera fricción de compra inmediata.
- **La Solución AutoProd:** Una arquitectura en dos niveles (*"Prueba gratis, escala con fidelidad"*):
  1. **Nivel Gratuito ($0 / Ilimitado):** Voces neuronales de Edge-TTS ejecutadas directamente en el motor local. Cero costos de API para el usuario y cero costos de servidor para AutoProd.
  2. **Nivel Premium / BYOK (OpenAI TTS & Futuros Motores):** Para producciones donde el creador busca tonos específicos (`alloy`, `onyx`, `nova`, etc.) o conectar su propia API Key sin recargo.
  3. **Puente Automático de Producción:** El audio generado se guarda en la carpeta `Ambiente/` del video y se conecta en 1 clic con el motor local de subtítulos (Faster-Whisper) para generar subtítulos palabra por palabra sin fricción.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Motor Local Gratuito Edge-TTS ($0)** | `✅ HECHO` | Streaming neuronal de Microsoft Edge sin límites ni cobro de créditos. |
| **Motor OpenAI TTS (`tts-1`)** | `✅ HECHO` | Voces OpenAI (`alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`). |
| **Gobernanza de Créditos (Deducción Atómica)** | `✅ HECHO` | 0 créditos si es Edge-TTS o BYOK Vault; 1 crédito/1k chars si usa créditos del sistema. |
| **Preescucha Rápida en Vivo (Preview)** | `✅ HECHO` | Botón para escuchar muestras cortas de cualquier voz antes de renderizar. |
| **Guardado en Taxonomía Oficial (`Ambiente/`)** | `✅ HECHO` | Persistencia en disco local respetando la estructura de carpetas de AutoProd. |
| **Puente 1-Clic a Subtítulos Faster-Whisper** | `✅ HECHO` | Botón "Generar Subtítulos para este Audio" que abre el Subtitulador Studio. |
| **Tool Agéntica del Cerebro (`generar_locucion`)** | `✅ HECHO` | Invocable autónomamente por el Orquestador central vía function calling. |
| **Integración con ElevenLabs API** | `⏳ FALTANTE` | Voces hiperrealistas con clonación de voz y selección de estabilidad. |
| **Integración con Cartesia (Sonic)** | `⏳ FALTANTE` | Generación de audio ultra-rápida de latencia menor a 150ms. |
| **Control de Entonación y Énfasis SSML** | `⏳ FALTANTE` | Pausas controladas (`<break>`), susurros y énfasis dramático en el texto. |
| **Clonación de Voz Local (XTTS v2 / F5-TTS)** | `⏳ FALTANTE` | Opción de clonar la voz del creador con 10 segundos de muestra ejecutándose en GPU local. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Auto-Segmentación por Escenas del Guion:**
   - Detectar encabezados o cortes de escena en el guion para generar archivos de audio separados por párrafo (`01_intro.mp3`, `02_problema.mp3`), facilitando su alineación en la línea de tiempo.
2. **Selector Inteligente de Voces según el Tono del Canal:**
   - El Orquestador analiza el archivo `Contexto_canal.md` (ej: terror, finanzas, meditación) y recomienda automáticamente el motor y la voz que mejor se adaptan a la identidad del canal.
3. **Control Deslizante de Velocidad & Tono en la UI:**
   - Ajuste fino de la velocidad de lectura (`0.8x` para misterio, `1.2x` para shorts dinámicos).
