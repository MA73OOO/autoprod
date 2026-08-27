const getControladorUrl = () => {
  if (typeof window !== 'undefined') {
    const port = localStorage.getItem('autoprod_motor_port') || '8000';
    return `http://localhost:${port}`;
  }
  return 'http://localhost:8000';
};

export class ControladorClient {
  /**
   * Verifica si el controlador local está corriendo y accesible.
   */
  static async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${getControladorUrl()}/status`, {
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
   * Instala o valida el motor de Python llamando a la API local de Next.js
   */
  static async installMotor(): Promise<void> {
    try {
      const response = await fetch('/api/setup/install', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Error al instalar o validar el motor');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido instalando el motor');
      }
    } catch (error) {
      console.error('Controlador Client: installMotor failed', error);
      throw error;
    }
  }

  /**
   * Apaga el motor local de Python
   */
  static async shutdownMotor(): Promise<void> {
    try {
      await fetch(`${getControladorUrl()}/shutdown`, { method: 'POST' });
    } catch (e) {
      console.warn('Motor apagado', e);
    }
  }

  /**
   * Envía un mensaje a la consola local de IA
   */
  static async askConsoleAI(prompt: string, commandTemplate: string): Promise<string> {
    try {
      const response = await fetch(`${getControladorUrl()}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, command_template: commandTemplate }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Error en la consola de IA');
      }
      return data.response;
    } catch (error) {
      console.error('Controlador Client: askConsoleAI failed', error);
      throw error;
    }
  }

  /**
   * Abre el explorador de archivos nativo del SO para que el usuario elija una carpeta.
   */
  static async pickWorkspace(): Promise<{ path: string }> {
    try {
      const response = await fetch(`${getControladorUrl()}/workspace/pick`);
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
      const response = await fetch(`${getControladorUrl()}/workspace/?base_path=${encodeURIComponent(basePath)}`);
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
      const response = await fetch(`${getControladorUrl()}/workspace/create`, {
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

  /**
   * Lee el contenido de un archivo
   */
  static async readFile(path: string): Promise<string> {
    try {
      const response = await fetch(`${getControladorUrl()}/workspace/file?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error leyendo el archivo');
      }
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Controlador Client: readFile failed', error);
      throw error;
    }
  }

  /**
   * Guarda el contenido en un archivo
   */
  static async saveFile(path: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${getControladorUrl()}/workspace/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error guardando el archivo');
      }
    } catch (error) {
      console.error('Controlador Client: saveFile failed', error);
      throw error;
    }
  }
}
