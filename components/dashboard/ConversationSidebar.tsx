'use client';

import { Language } from '@/app/translations';
import { Channel, Conversation } from './types';

interface Props {
  lang: Language;
  channels: Channel[];
  conversations: Conversation[];
  activeConversationId: string | null;
  activeView: 'home' | 'chat';
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export default function ConversationSidebar({
  lang,
  channels,
  conversations,
  activeConversationId,
  activeView,
  onNewConversation,
  onSelectConversation,
}: Props) {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-4">
      {/* New Conversation Button */}
      <button
        onClick={onNewConversation}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 rounded-lg text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        💬 {lang === 'es' ? 'Nueva Conversación' : 'New Conversation'}
      </button>

      {/* Conversations History */}
      <div className="space-y-2 shrink-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {lang === 'es' ? 'Historial de Chats' : 'Chat History'}
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left py-2 px-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 ${
                activeView === 'chat' && activeConversationId === conv.id
                  ? 'bg-zinc-800 text-purple-400 font-semibold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <span className="truncate w-full font-medium text-left">{conv.title}</span>
              <div className="flex justify-between items-center w-full text-[9px] text-zinc-600 font-mono">
                <span>{conv.createdAt}</span>
                {conv.channelId && (
                  <span className="text-[8px] px-1 py-0.2 bg-purple-500/10 text-purple-400 rounded">
                    {channels.find(ch => ch.id === conv.channelId)?.name || 'Canal'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Channels list */}
      {channels.length > 0 && (
        <>
          <span className="h-[1px] bg-zinc-800" />
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {lang === 'es' ? 'Canales' : 'Channels'}
            </h4>
            <div className="space-y-3">
              {channels.map(channel => (
                <div key={channel.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                    <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    {channel.name}
                  </div>
                  <div className="pl-5 space-y-1">
                    {channel.videos.map(video => (
                      <div
                        key={video.id}
                        className="text-[11px] text-zinc-500 py-0.5 flex items-center gap-1.5"
                      >
                        <span className="h-1 w-1 rounded-full bg-zinc-700 shrink-0" />
                        <span className="truncate">{video.name}</span>
                        <span className={`ml-auto text-[9px] px-1 rounded shrink-0 ${
                          video.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10' :
                          video.status === 'RENDERING' ? 'text-yellow-400 bg-yellow-500/10' :
                          'text-zinc-500 bg-zinc-800'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
