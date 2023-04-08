import { ObjectId } from 'mongodb';

export interface Message {
  role: string;
  content: string;
  avatarSource: string;
  sender: string;
}

export interface Conversation {
  participants?: any[];
  name?: string,
  messages: Message[],
  id?: number,
  isActive?: boolean,
  isPublic: boolean,
  ownerId: number,
  creatorId: number,
}