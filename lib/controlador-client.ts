export function getControladorUrl() {
  if (typeof window !== 'undefined') {
    const port = localStorage.getItem('autoprod_motor_port') || '8000';
    return `http://127.0.0.1:${port}`;
  }
  return 'http://127.0.0.1:8000';
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
   * Arranca el motor de Python llamando a la API local de Next.js
   */
  static async startMotor(port: number = 8000): Promise<void> {
    try {
      const response = await fetch('/api/motor/start', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      });
      
      if (response.status === 409) {
        throw new Error('PORT_IN_USE');
      }
      
      if (!response.ok) {
        throw new Error('Error al arrancar el motor');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido arrancando el motor');
      }
    } catch (error) {
      console.error('Controlador Client: startMotor failed', error);
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
   * Obtiene la ruta por defecto del workspace de AutoProd
   */
  static async getDefaultWorkspace(): Promise<{ path: string }> {
    try {
      const response = await fetch(`${getControladorUrl()}/workspace/default`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la ruta por defecto');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: getDefaultWorkspace failed', error);
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

  /**
   * Inspecciona las propiedades de un archivo de video o audio
   */
  static async inspectMedia(filePath: string): Promise<any> {
    try {
      const response = await fetch(`${getControladorUrl()}/video/inspect_media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error inspeccionando medio');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: inspectMedia failed', error);
      throw error;
    }
  }

  /**
   * Escanea una carpeta en busca de canciones y calcula la duración total
   */
  static async scanAudioFolder(folderPath: string): Promise<any> {
    try {
      const response = await fetch(`${getControladorUrl()}/video/scan_audio_folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_path: folderPath }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error escaneando carpeta de audio');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: scanAudioFolder failed', error);
      throw error;
    }
  }

  /**
   * Inicia el renderizado de un loop de video (previsualización o export completo)
   */
  static async createVideoLoop(params: {
    videoPaths: string[];
    durationMode?: 'custom' | 'audio_folder';
    targetDurationSeconds?: number;
    audioFolderPath?: string | null;
    resolution?: string;
    quality?: string;
    isPreview?: boolean;
    outputChannel?: string | null;
    outputFilename?: string | null;
  }): Promise<{ job_id: string; status: string; is_preview: boolean; message: string }> {
    try {
      const response = await fetch(`${getControladorUrl()}/video/create_loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_paths: params.videoPaths,
          duration_mode: params.durationMode || 'custom',
          target_duration_seconds: params.targetDurationSeconds || 300,
          audio_folder_path: params.audioFolderPath || null,
          resolution: params.resolution || '1080p',
          quality: params.quality || 'high',
          is_preview: params.isPreview ?? false,
          output_channel: params.outputChannel || null,
          output_filename: params.outputFilename || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error iniciando loop de video');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: createVideoLoop failed', error);
      throw error;
    }
  }

  /**
   * Consulta el estado y progreso de un job de renderizado
   */
  static async getVideoJobStatus(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${getControladorUrl()}/video/status/${encodeURIComponent(jobId)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error consultando estado del render');
      }
      return await response.json();
    } catch (error) {
      console.error('Controlador Client: getVideoJobStatus failed', error);
      throw error;
    }
  }

  /**
   * Retorna la URL directa para streaming de la previsualización
   */
  static getPreviewVideoUrl(jobId: string): string {
    return `${getControladorUrl()}/video/preview/${encodeURIComponent(jobId)}`;
  }
}
