export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thinking?: string; // Content of the thinking process
  image?: string; // Base64 image
  timestamp: number;
}

export enum AppTab {
  CHAT = 'CHAT',
  TRAINING = 'TRAINING',
  SETTINGS = 'SETTINGS'
}
