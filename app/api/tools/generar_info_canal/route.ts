import { POST as crearCanalHandler } from '../crear_canal/route';

/**
 * Endpoint retrocompatible: delega directamente a /api/tools/crear_canal
 * Asegura que cualquier llamada previa a generar_info_canal cree correctamente
 * la carpeta InfoCanal/ y sus 4 archivos de memoria canónicos.
 */
export async function POST(req: Request) {
  return crearCanalHandler(req);
}
