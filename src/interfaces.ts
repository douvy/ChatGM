import { ObjectId } from 'mongodb';
import { User, Conversation as PrismaConversation } from "@prisma/client";

export interface Message {
  role: string,
  content: string;
  avatarSource: string,
  sender?: User,
  senderId: number
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

export interface UserInfo {

}