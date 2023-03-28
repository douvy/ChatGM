import { ObjectId } from 'mongodb';

interface Message {
    role: string;
    content: string;
    avatarSource: string;
    sender: string;
}

interface Conversation {
    messages: Message[];
    _id?: ObjectId;
}

export { Message, Conversation }