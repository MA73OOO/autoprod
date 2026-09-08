# 💳 Subscriptions, Billing & Token Economics

## 📌 Qué hace
Esta funcionalidad implementa el sistema integral de monetización, suscripciones y economía de tokens de AutoProd:

1. **Niveles de Suscripción (Tiers Comerciales):**
   - **Prueba Gratuita (FREE):** $0 USD, 50 créditos iniciales de cortesía, 1 canal de YouTube para pruebas, Video Looper Web básico hasta 720p y descarga del Motor Local AutoProd para probar la experiencia completa en PC. AutoProd Brain™ descuenta 1 crédito por interacción como medida anti-abuso.
   - **Starter ($70 USD/mes):** Diseñado para creadores profesionales enfocados. **1 Canal de YouTube Profesional**, **Descarga del Motor Local AutoProd** (procesamiento GPU/CPU offline en PC y Whisper local ilimitado), Looper 1080p, 60 min de Whisper Cloud y una bolsa mensual de **1,800 créditos de IA netos** ($20 de presupuesto menos 10% de comisión AutoProd).
   - **Pro ($100 USD/mes - 🔥 Más Popular):** Diseñado para productores multi-nicho y agencias. **Hasta 3 Canales de YouTube simultáneos**, **Motor Local Completo con aceleración CUDA/GPU**, Looper 4K (3 hrs) + Batch, Modo Carpeta Canciones, Memoria Vectorial y bolsa mensual de **2,700 créditos de IA netos** ($30 de presupuesto menos 10% de comisión).
   - **Enterprise ($150 USD/mes - 👑 VIP):** Potencia máxima sin restricciones. **Canales de YouTube ILIMITADOS**, **Motor Local Enterprise** (rendimiento extremo sin compresión), Looper 4K 60fps, 500 min Whisper Cloud, soporte prioritario 1 a 1 y bolsa mensual de **4,500 créditos de IA netos** ($50 de presupuesto menos 10% de comisión).

2. **Beneficio y Licenciamiento del Motor Local:**
   - La descarga e instalación automatizada del **Motor Local (FastAPI Python en localhost:8000)** está habilitada para todos los planes (incluyendo Free) para que cualquier creador configure su workspace físico a costo $0 para AutoProd.
   - El incentivo de conversión y límite real del plan Free radica en la bolsa de 50 créditos de cortesía y el límite estricto a 1 solo canal de YouTube. Al agotar sus créditos o querer más canales, el usuario realiza el upgrade.

3. **Regla de Negocio del Orquestador (AutoProd Brain™):**
   - Para todos los planes de pago (Starter, Pro, Enterprise), el copiloto autónomo **AutoProd Brain™** (impulsado por `gpt-4o-mini`) es **100% GRATIS e ILIMITADO** (0 créditos descontados). AutoProd asume el costo de API (~$0.75 - $1.00 USD por usuario intensivo al mes), garantizando un margen de ganancia neto superior al 98%.
   - Para usuarios gratuitos (Free Trial), AutoProd Brain™ descuenta 1 crédito por mensaje para evitar bots y agotamiento abusivo de infraestructura.

4. **Economía de Tokens y Modelos Pesados:**
   - 1 USD equivale a 100 créditos AutoProd (1 crédito = $0.01 USD).
   - El saldo del Wallet se reserva estrictamente para llamadas a modelos pesados (GPT-4o, Claude 3.5 Sonnet, Gemini Pro), minutos de transcripción Whisper Cloud y renderizado en la nube.
   - Las tarifas de cada modelo o servicio se configuran de forma dinámica en la tabla `ServicePricing` y son administrables desde el panel de `/admin`.

5. **Pasarela Dual (Internacional + Local Nequi):**
   - **Lemon Squeezy:** Generación de checkouts seguros (`/api/payments/checkout`) y recepción de webhooks con firma HMAC SHA-256 (`/api/webhooks/lemonsqueezy`) para renovación automática y acreditación de saldo.
   - **Activación Manual Nequi / Bancolombia / Daviplata:** Modal integrado para usuarios de Colombia y Latinoamérica con enlace directo a WhatsApp para comprobantes y botón de activación manual en `/admin` que registra la transacción en `PaymentLedger` y actualiza `UserSubscription` y `Wallet` atómicamente.

---

## ⚙️ Cómo lo hace

### 1. Sincronización Inicial del Usuario (`/api/auth/sync`)
- Cuando el usuario inicia sesión o se registra, se asegura la existencia del plan `FREE` y un registro en `Wallet` con 50 créditos iniciales de cortesía.
- Retorna el perfil completo con plan actual, límites y balance de créditos.

### 2. Orquestación y Cobro Atómico en Chat (`/api/chat`)
- Al recibir una solicitud, verifica si el modelo solicitado es gratuito para el plan del usuario mediante `isOrchestratorFreeForUser(userPlan, model)`.
- Si requiere créditos, consulta `ServicePricing` para determinar el costo por unidad.
- Si el balance en `Wallet` es inferior al costo requerido, responde con código **HTTP 402** y payload `{ error: '...', requiresUpgrade: true }`.
- En el cliente (`app/dashboard/page.tsx`), la respuesta 402 abre de manera reactiva el modal `SubscriptionPlansModal`.
- Tras una respuesta exitosa, se descuentan los créditos de forma atómica en `Wallet` y se registra el evento en `CreditConsumption`.
- **Blindaje de Límite de Canales por Plan:** Inyecta en el `systemPrompt` el límite de canales (`maxChannels`) y los canales existentes. Si el usuario ya alcanzó el límite (ej: 1 canal en Free/Starter), la IA rechaza crear nuevos canales. Adicionalmente, las herramientas `crear_carpetas` y `extraer_canal_youtube` interceptan cualquier intento en el backend, bloqueando la llamada al motor local y devolviendo un error controlado `[LÍMITE DE PLAN ALCANZADO]`.

### 3. Pasarela de Pago Lemon Squeezy
- El cliente llama a `POST /api/payments/checkout` con `{ planName: 'STARTER' | 'PRO' | 'ENTERPRISE' }`.
- Si las credenciales están configuradas en `.env`, genera un checkout oficial con `custom.user_id` y `custom.plan_name`.
- Al completarse el pago, Lemon Squeezy notifica a `/api/webhooks/lemonsqueezy`.
- El webhook valida la firma `X-Signature`, calcula los créditos netos descontando la comisión del 10%, actualiza `UserSubscription` (con `currentPeriodEnd = now + 30 días`), incrementa `Wallet.balance` y genera un asiento contable en `PaymentLedger`.

### 4. Activación Manual por Admin (`/api/admin/users/manual-subscription`)
- En `/admin`, cada usuario cuenta con el botón **⚡ Nequi**.
- El modal administrativo permite seleccionar el plan (Starter, Pro, Enterprise), los días de vigencia (30 días por defecto) y la referencia de transferencia.
- El backend calcula la comisión, suma los créditos al balance del usuario, actualiza la suscripción y genera el comprobante en `PaymentLedger`.

---

## 📂 Archivos Involucrados

| Componente | Archivo | Responsabilidad |
| :--- | :--- | :--- |
| **Configuración Central** | [`lib/pricing-config.ts`](file:///e:/autoprod/lib/pricing-config.ts) | Definición de planes, comisiones, créditos y lógica `isOrchestratorFreeForUser`. |
| **Setup & Seed** | [`scripts/seed-plans.ts`](file:///e:/autoprod/scripts/seed-plans.ts) | Población de planes, límites y precios por servicio en PostgreSQL. |
| **Setup Route** | [`app/api/setup/plans/route.ts`](file:///e:/autoprod/app/api/setup/plans/route.ts) | Endpoint de verificación de existencia de planes y precios en base de datos. |
| **Auth Sync** | [`app/api/auth/sync/route.ts`](file:///e:/autoprod/app/api/auth/sync/route.ts) | Asignación inicial de plan Free y 50 créditos en Wallet. |
| **Validación de Consumo** | [`app/api/chat/route.ts`](file:///e:/autoprod/app/api/chat/route.ts) | Control de orquestador gratis vs cobro de tokens y respuesta 402. |
| **Checkout Lemon** | [`app/api/payments/checkout/route.ts`](file:///e:/autoprod/app/api/payments/checkout/route.ts) | Creación de sesión de checkout en Lemon Squeezy o fallback Nequi. |
| **Webhook Lemon** | [`app/api/webhooks/lemonsqueezy/route.ts`](file:///e:/autoprod/app/api/webhooks/lemonsqueezy/route.ts) | Verificación criptográfica HMAC y acreditación de suscripción/tokens. |
| **Admin API** | [`app/api/admin/users/route.ts`](file:///e:/autoprod/app/api/admin/users/route.ts) | Lista de usuarios reales con tokens, planes y estado. |
| **Admin Nequi Manual** | [`app/api/admin/users/manual-subscription/route.ts`](file:///e:/autoprod/app/api/admin/users/manual-subscription/route.ts) | Activación de pagos locales Nequi/Daviplata/Bancolombia. |
| **Admin Pricing & Ledger** | [`app/api/admin/pricing/route.ts`](file:///e:/autoprod/app/api/admin/pricing/route.ts), [`app/api/admin/ledger/route.ts`](file:///e:/autoprod/app/api/admin/ledger/route.ts) | Gestión de tarifas por servicio y libro mayor contable. |
| **Panel Admin UI** | [`app/admin/page.tsx`](file:///e:/autoprod/app/admin/page.tsx) | Interfaz visual del admin con tablas de usuarios, tokens y modales de pago. |
| **Modal de Suscripciones** | [`components/dashboard/SubscriptionPlansModal.tsx`](file:///e:/autoprod/components/dashboard/SubscriptionPlansModal.tsx) | Modal interactivo de planes, checkout con tarjeta y flujo Nequi por WhatsApp. |
| **Contador de Tokens** | [`components/dashboard/CreditCounter.tsx`](file:///e:/autoprod/components/dashboard/CreditCounter.tsx) | Widget en cabecera que muestra saldo en tiempo real y abre planes al hacer clic. |
| **Dropdown de Perfil** | [`components/dashboard/ProfileDropdown.tsx`](file:///e:/autoprod/components/dashboard/ProfileDropdown.tsx) | Opción directa "⚡ Planes & Suscripción". |
| **Ajustes de Usuario** | [`components/dashboard/UserSettingsModal.tsx`](file:///e:/autoprod/components/dashboard/UserSettingsModal.tsx) | Pestaña de Facturación con estado de suscripción real y botón de actualización. |
| **Dashboard Principal** | [`app/dashboard/page.tsx`](file:///e:/autoprod/app/dashboard/page.tsx) | Detección reactiva de error 402, montaje de modales y alerta `payment=success`. |
| **Landing Page** | [`app/page.tsx`](file:///e:/autoprod/app/page.tsx) | Sección `#pricing` pública con los 4 planes, beneficios y llamada a la acción. |

---

## 🎯 Propósito
1. **Sustentabilidad y Alto Margen:** Al absorber únicamente el costo mínimo de `gpt-4o-mini` y monetizar a $70, $100 y $150 USD, AutoProd asegura ingresos recurrentes predecibles con márgenes brutos superiores al 95%.
2. **Eliminación de Fricción de Pago en Latinoamérica:** Al ofrecer Nequi y transferencias locales junto con Lemon Squeezy, se capturan creadores en Colombia y la región hispanohablante que no cuentan con tarjetas de crédito internacionales.
3. **Escalabilidad y Control de Abusos:** La regla de descontar 1 crédito a los usuarios gratuitos garantiza que ninguna granja de bots pueda consumir recursos de forma desmedida sin pagar.
