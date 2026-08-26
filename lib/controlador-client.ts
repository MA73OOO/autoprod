const CONTROLADOR_URL = 'http://localhost:8000';

export class ControladorClient {
  /**
   * Verifica si el controlador local está corriendo y accesible.
   */
  static async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${CONTROLADOR_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Timeout corto para no colgar la UI si no está
        signal: AbortSignal.timeout(2000) 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lista el contenido del workspace.
   */
  static async getWorkspace(basePath: string) {
    try {
      const response = await fetch(`${CONTROLADOR_URL}/workspace/?base_path=${encodeURIComponent(basePath)}`);
      if (!response.ok) {
        throw new Error('Error fetching workspace');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: getWorkspace failed', error);
      throw error;
    }
  }

  /**
   * Inicializa la estructura de carpetas de un video.
   */
  static async initVideoWorkspace(basePath: string, channelName: string, videoName: string, customFolders?: string[]) {
    try {
      const response = await fetch(`${CONTROLADOR_URL}/workspace/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_path: basePath,
          channel_name: channelName,
          video_name: videoName,
          folders: customFolders
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error initializing workspace');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: initVideoWorkspace failed', error);
      throw error;
    }
  }
}
