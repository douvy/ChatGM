import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method, query: { id } } = req;

    switch (method) {
        case 'GET':
            try {
                const conversation = await prisma.conversation.findUnique({ where: { id: Number(id) }, include: { messages: true } });
                res.status(200).json(conversation);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'POST':
            try {
                const { name, messages } = req.body;
                const conversation = await prisma.conversation.create({
                    data: { name, messages: { createMany: { data: messages } } },
                    include: { messages: true },
                });
                res.status(201).json(conversation);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { name, messages } = req.body;
                const data = {};

                if (name !== undefined) {
                    data.name = name;
                }

                if (messages !== undefined) {
                    data.messages = { upsert: messages.map(msg => ({ where: { id: msg.id || -1 }, create: msg, update: msg })) };
                }

                const conversation = await prisma.conversation.update({
                    where: { id: parseInt(id) },
                    data,
                    include: { messages: true },
                });

                res.status(200).json(conversation);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'DELETE':
            console.log("Deleting conversation");
            console.log(id);
            try {
                const conversation = await prisma.conversation.delete({
                    where: { id: parseInt(id) },
                });
                res.status(200).json(conversation);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}
