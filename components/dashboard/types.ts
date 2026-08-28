export interface Message {
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  modelName?: string;
  generationTimeMs?: number;
  isGenerating?: boolean;
  isTemp?: boolean;
  isQueued?: boolean;
}

export interface Video {
  id: string;
  name: string;
  status: string;
}

export interface Channel {
  id: string;
  name: string;
  videos: Video[];
}

export interface Conversation {
  id: string;
  title: string;
  channelId: string | null;
  messages: Message[];
  createdAt: string;
}
