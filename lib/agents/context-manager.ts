import path from 'path';

/**
 * Utility to communicate with the local Python Motor
 * for fetching context files from the workspace.
 */
async function callMotor(endpoint: string) {
  const url = `http://localhost:8000/workspace${endpoint}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Motor error: ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    console.error(`Error en ContextManager (${endpoint}):`, error);
    return null;
  }
}

export class ContextManager {
  /**
   * Lee un archivo específico usando el Motor Python
   */
  static async readFile(filePath: string): Promise<string | null> {
    const data = await callMotor(`/file?path=${encodeURIComponent(filePath)}`);
    return data ? data.content : null;
  }

  /**
   * Extrae las reglas globales del proyecto (PROMPT_OPTIMIZADOR_SEO.md y PLANTILLA_DESCRIPCIONES.md)
   */
  static async getGlobalRules(workspacePath: string): Promise<string> {
    let globalRules = "--- REGLAS GLOBALES DEL SISTEMA ---\n";
    
    // Intenta leer el archivo de reglas SEO
    const seoPath = path.join(workspacePath, 'PROMPT_OPTIMIZADOR_SEO.md');
    const seoContent = await this.readFile(seoPath);
    if (seoContent) {
      globalRules += `[REGLAS SEO Y FORMATO]\n${seoContent}\n\n`;
    }

    // Intenta leer el archivo de plantilla
    const plantillaPath = path.join(workspacePath, 'PLANTILLA_DESCRIPCIONES.md');
    const plantillaContent = await this.readFile(plantillaPath);
    if (plantillaContent) {
      globalRules += `[PLANTILLA DE DESCRIPCIONES]\n${plantillaContent}\n\n`;
    }

    if (globalRules === "--- REGLAS GLOBALES DEL SISTEMA ---\n") {
      return "No se encontraron reglas globales en la raíz del proyecto.";
    }

    return globalRules;
  }

  /**
   * Extrae las reglas específicas del canal (.autoprod_channel.md)
   */
  static async getChannelRules(workspacePath: string, channelName: string): Promise<string> {
    const channelPath = path.join(workspacePath, channelName, '.autoprod_channel.md');
    const channelContent = await this.readFile(channelPath);
    
    if (channelContent) {
      return `--- REGLAS ESPECÍFICAS DEL CANAL: ${channelName} ---\n${channelContent}`;
    }
    
    return `No se encontró archivo de reglas (.autoprod_channel.md) para el canal ${channelName}.`;
  }
}
