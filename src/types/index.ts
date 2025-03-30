
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  isCommand: boolean;
}

export interface VideoState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  lastUpdated: number;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  videoState: VideoState;
  messages: ChatMessage[];
  createdAt: number;
}

export type ChatCommand = 
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; value: number }
  | { type: 'speed'; value: number }
  | { type: 'volume'; value: number }
  | { type: 'quality'; value: string }
  | { type: 'fullscreen' }
  | { type: 'share'; videoId: string };

export interface CommandResponse {
  success: boolean;
  message: string;
}
