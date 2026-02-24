export enum AppTab {
  DASHBOARD = 'dashboard',
  IMAGE_WELLNESS = 'image_wellness',
  LIVE_EMOTION = 'live_emotion',
  VOICE_REFLECTION = 'voice_reflection',
  CHAT_SUPPORT = 'chat_support',
  PRODUCTIVITY = 'productivity',
  ACCESSIBILITY = 'accessibility',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface WellnessRecord {
  date: Date;
  score: number;
  type: 'image' | 'voice' | 'emotion';
}
