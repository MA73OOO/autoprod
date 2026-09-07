# 💡 Idea & Escalabilidad: Auth Guard & Seguridad SSR

> **Ruta:** `docs/features/auth_guard/idea.md`  
> **Propósito:** Proteger los datos, conversaciones y claves de API del creador con velocidad instantánea (0ms de latencia) y seguridad corporativa.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** Consultar al servidor de autenticación en la nube en cada cambio de ruta o carga de página de Next.js añade entre 200ms y 500ms de latencia innecesaria, haciendo que la aplicación se sienta lenta. Además, manejar claves de API de IA (BYOK) en el navegador expone al usuario al robo de credenciales.
- **La Solución AutoProd:** Un guardián de sesión de doble capa que valida el JWT en 0ms localmente en el servidor de Next.js, respaldado por Supabase Vault para encriptar las claves de IA con nivel bancario.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Fast-Path JWT Local (0ms)** | `✅ HECHO` | Decodificación síncrona en Server Components y API Routes. |
| **Fallback Seguro a Red Supabase** | `✅ HECHO` | Validación ante cookies expiradas o manipuladas. |
| **Sincronización Automática (`/api/auth/sync`)** | `✅ HECHO` | Asigna plan Free y saldo inicial a nuevos registros. |
| **Almacenamiento Cifrado en Vault RPC** | `✅ HECHO` | Claves BYOK encriptadas en la base de datos. |
| **Inicio de Sesión con Magic Link por Email** | `⏳ FALTANTE` | Opción para usuarios que prefieren no usar Google OAuth. |
| **Soporte de Autenticación en 2 Pasos (2FA / TOTP)** | `⏳ FALTANTE` | Seguridad adicional para cuentas Enterprise y de agencias. |
| **Cierre de Sesión en Todos los Dispositivos** | `⏳ FALTANTE` | Botón para invalidar tokens remotos en caso de sospecha de brecha. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Gestión de Sesiones Concurrentes por Máquina:**
   - Detectar si la misma cuenta está siendo utilizada en múltiples computadores simultáneamente para respetar los límites del plan contratado.
2. **Tokens de Acceso de API Personal (Personal Access Tokens):**
   - Permitir a desarrolladores generar un token Bearer para conectar herramientas externas o scripts propios con AutoProd.
