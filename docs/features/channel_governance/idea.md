# 💡 FEAT-12 — Gobernanza de Canales: Visión & Escalabilidad

## ¿Por qué existe esta funcionalidad?

AutoProd es una herramienta de monetización para creadores. La monetización real requiere **foco de nicho**: un canal exitoso no mezcla temas. Si la IA ayuda a hacer contenido fuera del nicho, daña el algoritmo del creador y daña la percepción de valor del producto.

Este módulo resuelve:
1. **Fraude de planes:** Sin límite de canales, un usuario FREE podría crear cientos de canales.
2. **Contaminación de nicho:** Sin guardrail, la IA podría ayudar a un canal de vaqueros a hacer videos de criptomonedas, arruinando el canal.
3. **Falta de trazabilidad:** Sin `localPath` en BD, no hay conexión entre el canal digital y la carpeta física del cliente.

---

## Alcance Completado ✅

- `localPath` y `niche` en modelo `Channel`
- `POST /api/channels` con validación de límite por plan
- Guardrail en `systemPrompt` del orquestador IA
- Selector permanente de canal activo en `ChatPanel`
- `channels` derivados desde BD con UUIDs reales (no solo nombres de carpetas físicas)
- `extraer_canal_youtube` guarda `localPath` y `niche` automáticamente

---

## ⏳ Lo Que Falta (Próximos Sprints)

| Item | Impacto | Esfuerzo |
|---|---|---|
| Panel de gestión de canales (CRUD UI) — editar nicho, ruta y nombre | Alto | M |
| Nicho detectado automáticamente por GPT al crear canal (en lugar de usar nombre del canal) | Alto | S |
| Validación en `extraer_canal_youtube` si el canal importado ya existe en otro usuario | Medio | S |
| Badge de "Guardrail Violado" en el chat cuando la IA rechaza una solicitud | Alto | S |
| Historial de rechazos por canal para análisis de comportamiento | Bajo | L |
| Multi-nicho dentro de un mismo canal PRO (sub-nichos aprobados) | Bajo | XL |

---

## Ideas de Escalabilidad

- **Brand Voice AI:** Cada canal define su tono, vocabulario prohibido y palabras clave del nicho; el guardrail los incorpora dinámicamente en el prompt.
- **Niche Validator con Embeddings:** Al crear contenido, comparar el embedding semántico del guion con el embedding del canal para dar un "Score de Coherencia de Nicho" (0-100%).
- **Alert de Deriva de Nicho:** Si el canal empieza a publicar sobre temas lejanos al nicho, alertar al creador antes de que el algoritmo penalice.
