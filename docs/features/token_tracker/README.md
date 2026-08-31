# 📊 Token Tracker

## 📌 Qué hace
Monitorea, contabiliza y almacena la cantidad de tokens (texto entrante y texto generado) que los distintos LLMs (Gemini, OpenAI, Anthropic) consumen durante las conversaciones, asociándolos al usuario y al proveedor en uso.

## 🛠️ Cómo lo hace
Utiliza un enfoque **Fire-and-Forget Asíncrono** para no penalizar la latencia del chat:
1. Durante la respuesta del modelo en `/api/chat/route.ts`, el SDK de Vercel AI (en la callback `onFinish` o tras concluir la ejecución de `generateText`) provee un objeto `usage`.
2. El sistema extrae `promptTokens` (entrada) y `completionTokens` (salida).
3. Se dispara una petición en el background (`prisma.tokenUsage.create()`) insertando una nueva fila con la fecha, el proveedor usado, el ID del modelo exacto (ej. `gemini-1.5-pro`) y el total de tokens.
4. El backend retorna la respuesta al usuario inmediatamente, sin esperar a que Prisma termine de escribir el registro.

## 📂 Archivos involucrados
- `prisma/schema.prisma` -> Define el modelo de base de datos `TokenUsage` con relación al `User`.
- `app/api/chat/route.ts` -> Dónde el consumo del SDK se intercepta y se guarda en la base de datos de manera silenciosa.

## 🎯 Propósito
1. **Analíticas Internas:** Permite graficar o limitar el uso (Plan Limits) a nivel de cuenta si AutoProd decide ofrecer cuentas "Manejadas" o en la nube en el futuro.
2. **Dashboard Financiero:** Mostrarle al usuario final (bajo el modelo BYOK) cuántos dólares de API real está gastando en su producción de contenido en comparación con modelos tradicionales.
