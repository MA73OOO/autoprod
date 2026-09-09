# 💡 Visión e Idea: Sistema Anti-Abuso, Rate Limiting y Protección del Free Trial

> **Módulo:** Anti-Abuse, Rate Limiting & Multi-Account Protection  
> **Estado:** `✅ HECHO`  
> **Propósito:** Permitir que los creadores nuevos prueben AutoProd al máximo sin fricción, blindando la plataforma contra abusos económicos.

---

## 🎯 El Problema que Resuelve

### 1. Frustración del Creador en el Plan Gratuito
Anteriormente, cada mensaje en el chat descontaba 1 crédito de los 50 de bienvenida. Si un usuario conversaba para explorar ideas o entender la plataforma, agotaba su saldo antes de generar su primera miniatura o estructurar su primer video.

### 2. Riesgo de Abuso por Bots y Multicuentas
Si el chat se vuelve gratuito y se otorgan 50 créditos sin restricciones, scripts automatizados o usuarios malintencionados podrían:
- Usar `/api/chat` como proxy no autorizado para otras aplicaciones.
- Crear decenas de cuentas con correos temporales para acumular créditos infinitos de DALL-E 3 / Whisper.

---

## 🚀 La Solución de AutoProd

1. **Chat Orquestador Base 100% Gratuito:**
   - Chatear con el asistente (`gpt-4o-mini` o `gemini-flash`) cuesta **0 créditos**.
   - Los 50 créditos de bienvenida alcanzan para que el creador complete **1 o 2 proyectos de video reales** (con miniaturas generadas por IA y recursos).
2. **Defensa de 4 Capas sin Fricción:**
   - **Ráfaga Controlada:** 15 mensajes por minuto evitan ataques DoS.
   - **Cuota Diaria:** 150 mensajes/día garantizan uso creador genuino.
   - **IP HMAC-SHA256:** Máximo 2 cuentas con bono por red, sin almacenar IPs en texto plano (privacidad total).
   - **Anti-Correos Temporales:** Filtrado de emails desechables.

---

## 🔮 Ideas de Escalabilidad Futura (`⏳ FALTANTES`)

1. **Cloudflare Turnstile Invisible en Signup:**
   - Integrar el widget Turnstile en `/login` para bloquear herramientas headless (Puppeteer/Playwright) antes de la autenticación.
2. **Device Fingerprinting Ligero:**
   - Huella digital de navegador para complementar la validación de IP en redes compartidas (ej. universidades, coworkings).
3. **Capacidad de Desbloqueo Manual para Equipos/Coworkings:**
   - Panel de administración para resetear el límite de IP si un estudio o agencia legítima tiene múltiples editores en la misma red.
