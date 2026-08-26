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
   * Apaga el motor local de Python
   */
  static async shutdownMotor(): Promise<void> {
    try {
      await fetch(`${CONTROLADOR_URL}/shutdown`, { method: 'POST' });
    } catch (e) {
      console.warn('Motor apagado', e);
    }
  }

  /**
   * Abre el explorador de archivos nativo del SO para que el usuario elija una carpeta.
   */
  static async pickWorkspace(): Promise<{ path: string }> {
    try {
      const response = await fetch(`${CONTROLADOR_URL}/workspace/pick`);
      if (!response.ok) {
        throw new Error('No se seleccionó carpeta o hubo un error');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: pickWorkspace failed', error);
      throw error;
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
   * Crea una nueva carpeta, opcionalmente con subcarpetas.
   */
  static async createFolder(targetPath: string, folderName: string, subfolders?: string[]) {
    try {
      const response = await fetch(`${CONTROLADOR_URL}/workspace/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_path: targetPath,
          folder_name: folderName,
          subfolders: subfolders || []
        }),
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
