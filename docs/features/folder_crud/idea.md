# 💡 Idea & Escalabilidad: Gestión de Workspace & Carpetas (Folder CRUD)

> **Ruta:** `docs/features/folder_crud/idea.md`  
> **Propósito:** Abstraer el sistema de archivos del sistema operativo para que usuarios e inteligencias artificiales interactúen a través de conceptos claros de producción audiovisual.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** La gestión de rutas de archivos en programación e IA es propensa a errores (barras invertidas `\` de Windows vs `/` de POSIX, rutas absolutas filtradas al usuario, carpetas mal ubicadas fuera del proyecto). Además, la IA tiende a alucinar nombres de carpetas si no existe una normalización estricta.
- **La Solución AutoProd:** Una capa de abstracción robusta que transforma cualquier comando en lenguaje natural (*"Crea el canal Historias Oscuras con carpetas de guiones y miniaturas"*) en llamadas normalizadas al sistema de archivos local, garantizando que todo se mantenga ordenado dentro del workspace asignado.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Creación en Bloque de Carpetas** | `✅ HECHO` | Crea canal y sus subcarpetas (`Guiones`, `Videos`, `Miniaturas`, `InfoCanal`) en 1 llamada. |
| **Normalización POSIX Universal** | `✅ HECHO` | Unifica barras y ancla rutas relativas a la raíz del workspace. |
| **Borrado Seguro y Búsqueda Flexible** | `✅ HECHO` | Elimina carpetas tolerando variaciones de mayúsculas, minúsculas y tildes. |
| **Selector Nativo de Carpetas del SO** | `✅ HECHO` | Abre la ventana oficial de selección de carpetas en Windows y macOS. |
| **Límite de Canales según Plan de Suscripción** | `✅ HECHO` | Bloquea la creación de carpetas si excede el cupo del plan del usuario. |
| **Plantillas de Estructura de Carpetas Personalizables** | `⏳ FALTANTE` | Permitir al creador definir su propio esquema de subcarpetas predeterminado. |
| **Renombrado Inteligente con Actualización de Referencias** | `⏳ FALTANTE` | Si se renombra un canal, actualizar automáticamente las rutas en la base de datos. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Auto-Limpieza de Archivos Temporales:**
   - Detectar archivos temporales huérfanos generados durante renders fallidos y ofrecer un botón de *"Limpiar Espacio en Disco"*.
2. **Soporte de Unidades de Disco Externas (SSD / HDD secundario):**
   - Permitir que canales pesados guarden sus videos en un disco secundario `D:\` o `E:\` sin desconfigurar el workspace principal.
