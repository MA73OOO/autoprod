# 🧪 Suites de Pruebas de AutoProd (`tests/`)

Este directorio contiene las pruebas automatizadas y de integración de AutoProd, organizadas por capas de responsabilidad arquitectónica.

---

## 📂 Archivos de Pruebas

### 1. `folder-crud.test.ts`
- **Capa:** Motor Local Python (FastAPI en `http://127.0.0.1:8000`).
- **Qué prueba:**
  - Creación individual y masiva de carpetas en el workspace local.
  - Creación recursiva con subcarpetas automáticas (`subfolders: [...]`).
  - Listado plano de directorios (`/workspace/list_flat`).
  - Eliminación múltiple de carpetas (`/workspace/delete_folder`).
  - Eliminación completa de canales.
- **Ejecución:**
  ```bash
  pnpm run test:crud
  # o bien:
  npx tsx tests/folder-crud.test.ts
  ```

---

### 2. `proxy-normalization.test.ts`
- **Capa:** Proxy Adaptador Next.js (`app/api/chat/route.ts`).
- **Qué prueba:**
  - Normalización inteligente de los distintos formatos de parámetros que genera `gpt-4o-mini` (`folders`, `folder_name` como array, alias en español `canal`/`carpetas`, rutas absolutas y relativas).
  - Anclaje automático de rutas contra el canal o el workspace raíz.
- **Ejecución:**
  ```bash
  pnpm run test:proxy
  # o bien:
  npx tsx tests/proxy-normalization.test.ts
  ```

---

### 3. `e2e-openai.test.ts`
- **Capa:** Integración E2E completa (OpenAI API + Vercel AI SDK + Proxy + Motor Local + Disco Duro).
- **Qué prueba:**
  - Envía la conversación real del usuario al modelo `gpt-4o-mini`.
  - Verifica que el modelo invoque la herramienta `eliminar_carpetas` con los argumentos estructurados correctos.
  - Comprueba físicamente en el disco duro que la carpeta seleccionada fue eliminada sin errores.
- **Requisitos:**
  - Motor local corriendo en `http://127.0.0.1:8000`.
  - `OPENAI_API_KEY` configurada en `.env`.
- **Ejecución:**
  ```bash
  pnpm run test:e2e
  # o bien:
  npx tsx tests/e2e-openai.test.ts
  ```
