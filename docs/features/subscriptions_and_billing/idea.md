# 💡 Idea & Escalabilidad: Subscriptions, Billing & Token Economics

> **Ruta:** `docs/features/subscriptions_and_billing/idea.md`  
> **Propósito:** Modelo de negocio SaaS hiper-rentable (>95% margen bruto) y eliminación de fricción de cobro global y local.

---

## 🎯 1. El Problema & La Oportunidad de Negocio

- **El Problema:** La mayoría de herramientas SaaS de video quiebran o tienen márgenes raquíticos porque intentan procesar video en la nube (AWS/GCP), pagando miles de dólares en servidores. Además, muchas plataformas globales pierden el mercado latinoamericano porque creadores en Colombia, México o Argentina no siempre poseen tarjetas de crédito internacionales con cupo en dólares.
- **La Solución AutoProd:** AutoProd monetiza la orquestación y el software a **$70, $100 y $150 USD/mes**, mientras el costo de cómputo pesado corre a $0 en la máquina del usuario. Integrar pasarela con Lemon Squeezy (manejo global de impuestos) más transferencias locales (Nequi / Bancolombia) desbloquea la máxima conversión en ambos mundos.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Estructura de Tiers ($70, $100, $150 USD)** | `✅ HECHO` | Starter (1 canal), Pro (3 canales), Enterprise (canales ilimitados). |
| **Integración Lemon Squeezy & Webhook** | `✅ HECHO` | Checkout alojado con firma HMAC para renovación automática. |
| **Activación Manual Nequi en `/admin`** | `✅ HECHO` | Registro con comprobante y acreditación inmediata de saldo y plan. |
| **Bolsa de Créditos en Wallet (1 USD = 100 créditos)** | `✅ HECHO` | Saldo para modelos pesados (GPT-4o, Claude) con cobro atómico. |
| **Orquestador `gpt-4o-mini` Gratuito para Planes Pagos** | `✅ HECHO` | Copiloto ilimitado para suscriptores sin descontar saldo. |
| **Portal de Auto-Gestión del Suscriptor** | `⏳ FALTANTE` | Botón para que el usuario cancele o cambie de plan directamente en Lemon Squeezy. |
| **Descuentos por Facturación Anual (2 Meses Gratis)** | `⏳ FALTANTE` | Toggle Mensual/Anual en el modal de planes con precio promocional. |
| **Recarga de Créditos Add-on (Bolsas Extra de $10, $25, $50)** | `⏳ FALTANTE` | Comprar más créditos de IA sin necesidad de subir de nivel de suscripción. |
| **Programa de Afiliados (Revenue Share)** | `⏳ FALTANTE` | Enlace de referidos para creadores que recomienden AutoProd con 20% recurrente. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Planes para Agencias (Pase Multi-Asiento / Seats):**
   - Paquete de $299 USD/mes que incluya 5 accesos concurrentes para editores y guionistas.
2. **Facturación Empresarial Automática con DIAN (Colombia):**
   - Generación de factura electrónica automática para empresas colombianas que paguen por transferencia bancaria.
3. **Alerta Preventiva de Saldo Bajo vía WhatsApp:**
   - Si el usuario está usando modelos pesados y le quedan menos de 100 créditos, enviar un aviso amistoso antes de que se pause su tarea.
