# ⚙️ Ficha Técnica: Subscriptions, Billing & Token Economics

> **Ruta:** `docs/features/subscriptions_and_billing/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** Next.js API Routes + Prisma (adapter-pg) + Lemon Squeezy SDK + Supabase PostgreSQL

---

## 🛠️ 1. Arquitectura de Datos y Modelos Prisma

```mermaid
erDiagram
    User ||--o| UserSubscription : "tiene activa"
    User ||--o| Wallet : "posee saldo"
    UserSubscription }|--|| Plan : "vinculada a"
    Plan ||--o| PlanLimit : "define límites"
    Wallet ||--o{ CreditConsumption : "registra gastos"
    User ||--o{ PaymentLedger : "asientos contables"
```

### Modelos Centrales en PostgreSQL:
- **`Plan`:** Catálogo de planes (`FREE`, `STARTER`, `PRO`, `ENTERPRISE`) con `monthlyPriceUsd` e identificadores de pasarela.
- **`PlanLimit`:** Restricciones de negocio (`maxChannels`, `maxVideosPerChannel`, `canRenderInCloud`, `hasAdvancedTemplates`).
- **`UserSubscription`:** Estado de suscripción (`ACTIVE`, `CANCELLED`, `EXPIRED`), fechas de ciclo y referencia a Lemon Squeezy.
- **`Wallet`:** Balance de créditos (1 USD = 100 créditos) para modelos pesados y consumos cloud.
- **`CreditConsumption` & `PaymentLedger`:** Trazabilidad inmutable de débitos y créditos con comisiones.

---

## 🔌 2. Endpoints de la Capa de Monetización

| Endpoint | Método | Descripción |
|---|:---:|---|
| `/api/payments/checkout` | `POST` | Genera la sesión de checkout alojada en Lemon Squeezy con `user_id` y `plan_name`. |
| `/api/webhooks/lemonsqueezy` | `POST` | Valida la firma HMAC `X-Signature`, renueva fechas de suscripción e incrementa créditos. |
| `/api/user/wallet` | `GET` | Devuelve el balance actual de créditos y el desglose de consumo del usuario. |
| `/api/admin/users/manual-subscription` | `POST` | Activación manual para pagos Nequi/Bancolombia con cálculo automático de comisiones. |
| `/api/admin/pricing` | `GET` / `POST` | Gestión dinámica de las tarifas de modelos de IA en `ServicePricing`. |
| `/api/images/generate` | `POST` | Generación de imágenes DALL-E 3 con débito atómico de 5 créditos en Wallet si usa llave de plataforma. |
| `/api/images/analyze` | `POST` | Análisis visual de estilo con GPT-4o-mini con débito de 1 crédito para cuentas FREE. |

---

## ⚖️ 3. Reglas de Validación y Consumo Atómico

1. **Resolución de Llaves (BYOK vs Sistema):**
   - **BYOK (Prioridad 1):** Si el usuario configuró sus claves en Supabase Vault (`openaiVaultId`, `geminiVaultId`, etc.) o vía RPC, se usa su clave privada, eximiéndolo de cualquier consumo de créditos en la plataforma (costo = 0).
   - **Llaves del Sistema (Prioridad 2):** Si el usuario no tiene BYOK, se usa la clave de la plataforma y se calcula el cobro de créditos según su plan.
2. **AutoProd Brain™ Gratuito para Planes Pagos:**
   - Evaluado en [`lib/pricing-config.ts`](file:///e:/autoprod/lib/pricing-config.ts) mediante `isOrchestratorFreeForUser()`.
   - Para planes `STARTER`, `PRO` y `ENTERPRISE`, las llamadas con `gpt-4o-mini` descuentan **0 créditos**.
   - Para plan `FREE`, descuenta **1 crédito** por interacción de sus 50 créditos iniciales de cortesía.
3. **Respuesta HTTP 402 Payment Required:**
   - Si el usuario solicita un modelo pesado (ej. GPT-4o = 3 créditos, Claude 3.5 = 4 créditos) o DALL-E 3 (5 créditos) sin saldo suficiente en su `Wallet`, el backend responde `402` con `{ requiresUpgrade: true }`, disparando reactivamente el modal [`SubscriptionPlansModal.tsx`](file:///e:/autoprod/components/dashboard/SubscriptionPlansModal.tsx).
4. **Reactividad Inmediata en el Frontend:**
   - Cada endpoint de consumo retorna `newBalance` y emite el evento global del navegador `autoprod:wallet-updated`. El widget [`CreditCounter.tsx`](file:///e:/autoprod/components/dashboard/CreditCounter.tsx) lo escucha para reflejar la reducción de saldo de forma instantánea sin latencia.
5. **Acceso al Motor Local:**
   - La descarga e instalación automatizada del motor local de Python está habilitada para todos los planes (incluyendo `FREE`), permitiendo a cualquier creador ejecutar renders locales y gestión de archivos en su hardware a costo $0 para la plataforma. El candado de conversión en el plan Free se gestiona mediante la bolsa de 50 créditos y el límite de 1 canal.

---

## 📂 4. Archivos Involucrados

- [`lib/pricing-config.ts`](file:///e:/autoprod/lib/pricing-config.ts): Lógica central de pricing, créditos y exenciones.
- [`app/api/chat/route.ts`](file:///e:/autoprod/app/api/chat/route.ts): Control de orquestador gratis vs cobro de tokens, deducción atómica y retorno de `newBalance`.
- [`app/api/auth/sync/route.ts`](file:///e:/autoprod/app/api/auth/sync/route.ts) & [`app/api/user/wallet/route.ts`](file:///e:/autoprod/app/api/user/wallet/route.ts): Asignación única de 50 créditos de cortesía al registrarse (sin reseteos involuntarios).
- [`app/api/images/generate/route.ts`](file:///e:/autoprod/app/api/images/generate/route.ts) & [`app/api/images/analyze/route.ts`](file:///e:/autoprod/app/api/images/analyze/route.ts): Descuento atómico de créditos para DALL-E 3 (5 créditos) y análisis visual (1 crédito en FREE).
- [`app/api/payments/checkout/route.ts`](file:///e:/autoprod/app/api/payments/checkout/route.ts): Endpoint de checkout Lemon Squeezy.
- [`app/api/webhooks/lemonsqueezy/route.ts`](file:///e:/autoprod/app/api/webhooks/lemonsqueezy/route.ts): Webhook handler con validación criptográfica.
- [`app/api/admin/users/manual-subscription/route.ts`](file:///e:/autoprod/app/api/admin/users/manual-subscription/route.ts): Activación manual Nequi.
- [`components/dashboard/SubscriptionPlansModal.tsx`](file:///e:/autoprod/components/dashboard/SubscriptionPlansModal.tsx): Modal de planes y pasarela dual.
- [`components/dashboard/CreditCounter.tsx`](file:///e:/autoprod/components/dashboard/CreditCounter.tsx): Widget de balance de créditos en vivo con listener reactivo.
