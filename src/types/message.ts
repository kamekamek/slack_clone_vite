export interface Message {
  id: string;
  content: string;
  channelId: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
} 