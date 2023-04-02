import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    try {
        const conversations = await prisma.conversation.findMany({ include: { messages: true } });
        const starredMessages = await prisma.message.findMany({ where: { starred: true } });
        const features = await prisma.feature.findMany();
        const tasks = await prisma.task.findMany();

        console.log({
            conversations: conversations,
            starredMessages: starredMessages,
            features: features,
            tasks: tasks,
        });
        res.status(200).json({ conversations, starredMessages, features, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data' });
    }
}