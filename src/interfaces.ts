export interface User {
  id: number;
  username: string;
  avatarSource: string | null;
}

export interface Message {
  role: string;
  content: string;
  avatarSource: string;
  sender?: User;
  senderId?: number;
}

export interface Conversation {
  participants?: any[];
  name?: string;
  messages: Message[];
  id?: number;
  isActive?: boolean;
  isPublic: boolean;
  ownerId: number;
  creatorId: number;
}

export interface PageProps {
  session: any;
  conversations: Conversation[];
  starredMessages: Message[];
  features?: Feature[];
  tasks?: any[];
  userInfo: any;
  activeTask: any;
  c: any;
}

export interface Session {
  user: {
    username: String;
    _id?: String;
  };
  _id?: String;
}

export interface UserInfo {}

export interface Feature {
  name: string;
  description: string;
}
