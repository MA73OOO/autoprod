# ⚙️ Ficha Técnica: Landing Page & Console UX/UI Revamp (FEAT-13)

> **Módulo:** Rediseño Integral de Frontend, Identidad Visual y Consola de Producción  
> **Estado:** `✅ HECHO`  
> **Archivos Modificados:**  
> - `public/logo.svg` (Logotipo oficial vectorial AP estilizado en #8629FE)  
> - `app/layout.tsx` (Fuentes Google: Plus Jakarta Sans, Space Grotesk, Inter)  
> - `app/globals.css` (Clases de utilidad de tipografía .font-logo, .font-title, .font-btn, etc.)  
> - `app/page.tsx` (Landing page con logotipo oficial, mockup interactivo y especificaciones realistas)  
> - `app/translations.ts` (Diccionario bilingüe actualizado con visión integral para creadores de video)  
> - `app/login/page.tsx` (Cabecera de autenticación con logotipo oficial vectorial)  
> - `app/dashboard/page.tsx` (Cabecera con logotipo oficial, switcher de estudios y status de motor local)  
> - `components/dashboard/Launchpad.tsx` (Tarjetas de acción directa: bucles, clips rápidos, subtítulos y portadas)  

---

## 🏗️ 1. Arquitectura y Componentes del Frontend

### 1.1 Branding e Identidad Visual
- **Logotipo Vectorial Oficial (`public/logo.svg`):**
  - Monograma geométrico estilizado `AP` con trazo redondeado morado (`#8629FE`).
  - Implementado con efecto de brillo suave (`drop-shadow`) en Navbar, Footer, Login y Dashboard Header.
- **Jerarquía Tipográfica Coherente:**
  - **Logo / Identidad:** *Plus Jakarta Sans* 800 (ExtraBold).
  - **Títulos y Titulares:** *Space Grotesk* 700 (Bold).
  - **Subtítulos y Bloques de Apoyo:** *Space Grotesk* 500 (Medium).
  - **Botones y CTAs:** *Plus Jakarta Sans* 600 (SemiBold).
  - **Cuerpo, Descripciones y Docs:** *Inter* 400 (Regular).
  - **Datos, Badges y UI:** *Inter* 500 (Medium).

### 1.2 Landing Page (`app/page.tsx`)
- **Identidad Central en el Hero:**
  - Logotipo oficial en gran escala (`AutoProdLogo`, contenedor `h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32`) con aura multicapa de neón violeta (`#8629FE`) y efecto glassmórfico.
  - Tagline insignia centrado directamente debajo del logo: *"Nunca había sido tan fácil producir tu contenido..."* (`t.heroTagline`), implementado con badge translúcido y pulso esmeralda.
- **Posicionamiento Transversal para Creadores:**
  - Orientado a creadores con cámara propia, editores, generadores de clips para Shorts/Reels/TikTok y canales automatizados.
  - Cero hipérboles irreales: Especificación precisa de bucles de 1 a 3 horas, sincronización de audio, subtitulado palabra por palabra, diseño de portadas 16:9 y 9:16, y optimización de metraje.
- **Showcase Interactivo del IDE:**
  - Pestañas funcionales con previsualización en tiempo real de Asistente de Guiones, Bucles y Clips, Subtitulador Dinámico, Miniaturas y Gestión de Canales.
- **FAQ y Sección Comparativa:**
  - Aclaración directa de compatibilidad con CapCut/Premiere, renderizado por hardware local y privacidad total de archivos.

### 1.3 Consola de Producción (`app/dashboard/page.tsx`)
- **Studio Quick Switcher:** Barra de botones en la cabecera para alternar al instante entre `Inicio (Launchpad)`, `Asistente IA`, `Bucles & Clips`, `Subtítulos`, `Miniaturas` y `Biblioteca de Recursos`.
- **Motor Status Monitor:** Indicador en tiempo real del motor local en `localhost:8000`.

---

## 🔒 2. Cumplimiento de Reglas del Repositorio
- Cero hardcoding en componentes: Todos los textos se gestionan en `app/translations.ts` con soporte bilingüe completo (`es` / `en`).
- Se preserva el Orquestador Central en `app/api/chat/route.ts` y las herramientas en `app/api/tools/`.
