# Proyecciones Financieras y Modelo de Precios (AutoProd)

Este documento define la estructura de monetización de AutoProd, separando radicalmente las operaciones de "Costo Cero" (ejecutadas localmente) de las operaciones "Premium" (ejecutadas en APIs de terceros).

---

## 1. Clasificación de Funcionalidades (Costos)

### 🟢 Operaciones Gratuitas / Costo Marginal (Casi $0)
Estas funciones se ejecutan gracias al **Motor Local (Python)** en la PC del cliente, usando su hardware e internet. El único costo para AutoProd es el de la orquestación ligera de texto (Gemini Flash), el cual es menor a `$0.005` por acción.
*   **Gestión del Workspace:** Leer, mover, organizar y renombrar archivos en carpetas locales.
*   **Programación y Subida a YouTube:** Subida directa (OAuth) desde la PC del usuario a YT. Cero costo de ancho de banda para nosotros.
*   **Editor Markdown y Visor de Imágenes:** IDE completo.
*   **Subtitulado Local:** Ejecución de Whisper de OpenAI en modo local.
*   **Mejora de Prompts:** Inyección de contexto y optimización de descripciones/títulos (LLM barato).

### 🔴 Operaciones Premium (APIs Externas)
Estas operaciones tienen un costo monetario directo y fijo por cada llamada, por lo cual **solo pueden ser consumidas mediante Tokens**.
*   **Voz en Off Ultra Realista:** ElevenLabs o OpenAI TTS (Costo: ~$0.01 a $0.30 por minuto).
*   **Generación de Imágenes / Miniaturas:** DALL-E 3 o Midjourney (Costo: ~$0.04 - $0.08 por imagen).
*   **Generación de B-Roll / Video:** Runway Gen-2 / Sora (Costo: Alto).
*   **Guiones Complejos (LLM Premium):** Usar GPT-4o o Claude 3.5 Sonnet nativo en lugar de Gemini Flash (Costo: ~$5.00 por millón de tokens).

---

## 2. Estructura de Planes (SaaS)

El objetivo es asegurar un margen de ganancia del 80-90% en el pago mensual, cubriendo la infraestructura básica y entregando una bolsa de "Tokens AutoProd" para consumos premium.

| Plan | Precio (Mes) | Canales | Gestión y Subida Local | Tokens Incluidos | Perfil Ideal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **STARTER** | **$12** | 1 Canal | Ilimitada | **200 Tokens** | Creador casual (1-4 videos/mes). Usa sus propias herramientas de edición, solo necesita programar y organizar. |
| **CREATOR** | **$29** | 5 Canales | Ilimitada | **1,000 Tokens** | Creador activo (15-30 videos/mes). Puede generar unas 20 miniaturas y algunos audios premium, el resto lo hace en local o BYOK. |
| **AGENCY** | **$69** | Ilimitados | Ilimitada | **3,000 Tokens** | Agencias y canales automatizados. Delegan orquestación completa y usan mucha voz en off e imágenes IA. |

> **Nota sobre BYOK (Bring Your Own Key):** En todos los planes, el usuario puede introducir sus propias API Keys (Suno, OpenAI, ElevenLabs). Al hacerlo, el uso de esas herramientas **no consume Tokens AutoProd**. Esto democratiza el uso y fideliza al cliente pesado.

---

## 3. Economía de los Tokens (Tokenomics)

Para proteger nuestras ganancias, asignaremos el valor del "Token AutoProd" anclado al centavo de dólar.
**Regla interna:** 10 Tokens AutoProd = $0.10 USD de costo real estimado.

### Tabla de Costos y Cobro en Tokens
| Acción | Proveedor Estimado | Costo Real (AutoProd) | Precio para el Usuario |
| :--- | :--- | :--- | :--- |
| **Miniatura IA** | DALL-E 3 | $0.04 | **5 Tokens** |
| **Voz en Off (1 Minuto)** | ElevenLabs | $0.15 | **20 Tokens** |
| **Generación B-Roll (4s)**| Runway Gen-2 | $0.20 | **25 Tokens** |
| **Guion (GPT-4o)** | OpenAI | $0.02 | **3 Tokens** |
| **Orquestación/Gestión** | Motor Local + Flash | < $0.001 | **0 Tokens (GRATIS)** |

### Análisis de Rentabilidad (Ejemplo Plan CREATOR - $29/mes)
*   **Ingreso Mensual:** $29.00
*   **Costo de Servidor/Base de Datos por usuario:** ~$1.00
*   **Tokens Entregados:** 1,000 Tokens.
*   **Costo Máximo si quema todos los tokens:** ~$10.00 (asumiendo nuestra regla interna).
*   **Beneficio Bruto Mínimo Asegurado:** $29 - $1 - $10 = **$18.00 (62% Margen)**.
*   **Beneficio Real Estimado:** Como muchos usuarios usan BYOK o no queman el 100% de los tokens, el margen real tiende al **80-85%**.

---

## 4. Conclusión

AutoProd democratiza la producción delegando el procesamiento pesado al ordenador del usuario. Vendemos **el control, la organización y la paz mental**. Las capacidades multimedia avanzadas se monetizan de forma escalonada, garantizando que nunca perderemos dinero por picos de uso en IA.
