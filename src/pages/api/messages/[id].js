import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method, query: { id } } = req;

    switch (method) {
        case 'GET':
            try {
                const message = await prisma.message.findUnique({ where: { id: Number(id) } });
                res.status(200).json(message);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'POST':
            try {
                const { content, role, sender, avatarSource, conversationId } = req.body;
                const message = await prisma.message.create({
                    data: { content, role, sender, avatarSource, conversationId: Number(conversationId) },
                });
                res.status(201).json(message);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { content, role, sender, avatarSource, conversationId, starred } = req.body;
                const message = await prisma.message.update({
                    where: { id: Number(id) },
                    data: { content, role, sender, avatarSource, conversationId: Number(conversationId), starred },
                });
                res.status(200).json(message);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'DELETE':
            try {
                const message = await prisma.message.delete({ where: { id: Number(id) } });
                res.status(200).json(message);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}
