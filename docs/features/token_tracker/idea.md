# 💡 Idea & Escalabilidad: Token Tracker

> **Ruta:** `docs/features/token_tracker/idea.md`  
> **Propósito:** Auditoría y transparencia financiera total del gasto en Inteligencia Artificial.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** La IA genera costos por cada palabra enviada y recibida. Si una plataforma no rastrea los tokens con precisión, los usuarios pueden incurrir en gastos desmedidos sin darse cuenta, o la empresa puede sufrir pérdidas si absorbe cuotas no monetizadas.
- **La Solución AutoProd:** Un registrador silencioso que audita cada interacción sin ralentizar el chat, permitiendo al creador ver exactamente cuánto ha consumido su canal y asegurando que la empresa mantenga márgenes netos superiores al 95%.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Rastreo Asíncrono de Tokens (Fire-and-Forget)** | `✅ HECHO` | 0ms de penalización de latencia en la respuesta del chat. |
| **Desglose por Proveedor y Modelo Específico** | `✅ HECHO` | Registra OpenAI, Gemini, Anthropic y Ollama por separado. |
| **Asociación por Usuario y Conversación** | `✅ HECHO` | Permite rastrear qué proyecto o guion consumió más recursos. |
| **Gráfica de Consumo Diario/Mensual en Dashboard** | `⏳ FALTANTE` | Visualización en gráficos de barras de gasto de tokens por canal. |
| **Límites de Presupuesto Configurable por el Usuario** | `⏳ FALTANTE` | Fijar un tope (ej: "no gastar más de $10 USD este mes en GPT-4o"). |
| **Calculadora de Costo Equivalente en Dólares** | `⏳ FALTANTE` | Traducir los números de tokens a centavos de dólar en la UI del usuario. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Recomendador de Modelo Más Eficiente:**
   - Si el usuario está usando GPT-4o para tareas sencillas como listar carpetas, sugerirle cambiar a `gpt-4o-mini` para ahorrar 90% de costo.
2. **Exportador de Reportes de Consumo en CSV/PDF:**
   - Permitir a agencias descargar el desglose de consumo por cliente para facturación transparente.
