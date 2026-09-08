'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  workspacePath: string;
  onSuccess?: () => void;
}

export default function ChannelCreatorConsole({ workspacePath, onSuccess }: Props) {
  const [channelName, setChannelName] = useState('');
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [audience, setAudience] = useState('');
  
  // Checkboxes de opciones
  const [includeConfigPrompt, setIncludeConfigPrompt] = useState(true);
  const [includeVisualPrompts, setIncludeVisualPrompts] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName || !theme) {
      toast.error('Nombre y Tema son obligatorios');
      return;
    }

    if (!workspacePath) {
      toast.error('Debes vincular una ruta maestra de Workspace primero');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Construyendo estructura del canal...');

    try {
      const res = await fetch('/api/tools/generar_info_canal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_canal: channelName,
          contexto_del_usuario: `Tema: ${theme}. Estilo: ${style || 'General'}. Audiencia: ${audience || 'Público general'}.`,
          _userContext: { workspacePath },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el canal');

      toast.success(`Canal "${channelName}" inicializado correctamente.`, { id: toastId });
      
      // Reset form
      setChannelName('');
      setTheme('');
      setStyle('');
      setAudience('');

      if (onSuccess) onSuccess();

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f12] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-w-2xl mx-auto mt-10">
      <div className="bg-purple-900/20 border-b border-purple-500/20 p-4">
        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          📺 Consola Agéntica: Arquitecto de Canales
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Ingresa los metadatos de tu nuevo canal. El sistema creará las carpetas locales y el archivo maestro de reglas (.autoprod_channel.md).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-300">Nombre del Canal (Carpeta) *</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
            placeholder="Ej: PawsAndPillows"
            className="bg-[#18181b] border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-300">Tema Principal *</label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ej: Mascotas durmiendo con música relajante"
            className="bg-[#18181b] border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none h-20"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold text-zinc-300">Estilo / Tono</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Ej: Relajante, tierno, aesthetic"
              className="bg-[#18181b] border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold text-zinc-300">Audiencia Objetivo</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ej: Personas con estrés, niños"
              className="bg-[#18181b] border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2 bg-[#18181b]/50 p-4 rounded-lg border border-zinc-800">
          <label className="text-xs font-bold text-zinc-300">Opciones Adicionales de Contexto</label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={includeConfigPrompt}
              onChange={(e) => setIncludeConfigPrompt(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0f0f12] border-zinc-700 text-purple-600 focus:ring-purple-500/50" 
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Incluir plantilla de Configuración Extendida (Descripciones y SEO)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={includeVisualPrompts}
              onChange={(e) => setIncludeVisualPrompts(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0f0f12] border-zinc-700 text-purple-600 focus:ring-purple-500/50" 
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Incluir prompts maestros para Miniatura y Banner
            </span>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? 'Construyendo...' : 'Generar Estructura 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
