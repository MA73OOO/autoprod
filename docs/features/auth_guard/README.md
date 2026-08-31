# 🔐 Auth Guard & JWT

## 📌 Qué hace
Garantiza que únicamente los usuarios autenticados puedan acceder al dashboard o hacer llamadas a los endpoints sensibles de la API (como crear un canal o chatear). Además, previene el desajuste de datos al sincronizar automáticamente los perfiles generados por Google OAuth con la base de datos central de Prisma.

## 🛠️ Cómo lo hace
Utiliza un patrón de **Verificación de Doble Capa** para optimizar la latencia (0ms Overhead en el Fast Path):
1. **Fast Path (JWT Local):** En peticiones de red o renderizados de Server Components, el Guard extrae las cookies de sesión depositadas por Supabase. Descifra manualmente los chunks de la cookie `sb-*-auth-token`, valida el formato base64 y extrae el identificador del usuario (`sub`) y su `email`. Si es exitoso, la latencia es virtualmente nula porque no realiza peticiones externas.
2. **Fallback Seguro (Llamada de Red):** Si el token está expirado o la cookie fragmentada de un modo ilegible, recae automáticamente en `supabase.auth.getUser()`, el cual valida el estado llamando al servidor de autenticación remoto.
3. **Sincronización:** Una vez extraído el ID de sesión, el webhook `/api/auth/sync` cruza ese ID de Supabase (`auth.users`) y verifica si existe en la tabla de PostgreSQL de AutoProd (`public.User`). Si no, inyecta un nuevo registro.

## 📂 Archivos involucrados
- `lib/auth.ts` -> Dónde se concentra la lógica de decodificación JWT de Supabase.
- `app/api/auth/sync/route.ts` -> El endpoint donde Prisma sincroniza los usuarios nuevos.
- `middleware.ts` -> (Si aplica) Interceptor que bloquea las rutas no autorizadas redireccionando al login.

## 🎯 Propósito
Mantener los datos de consumo de IA, conversaciones y archivos seguros, y reducir la carga/latencia en los Server Components evitando llamados innecesarios a Supabase en cada carga de página.
