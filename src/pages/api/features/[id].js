import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method, query: { id } } = req;
    console.log(req.query)

    switch (method) {
        case 'GET':
            try {
                if (id) {
                    const feature = await prisma.feature.findUnique({
                        where: { id: parseInt(id) },
                    });
                    res.status(200).json(feature);
                } else {
                    const features = await prisma.feature.findMany();
                    res.status(200).json(features);
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'POST':
            try {
                const { name, description, starred } = req.body;
                const feature = await prisma.feature.create({
                    data: { name, description, starred },
                });
                res.status(201).json(feature);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { name, description, starred } = req.body;
                const feature = await prisma.feature.update({
                    where: { id: parseInt(id) },
                    data: { name, description, starred },
                });
                res.status(200).json(feature);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        case 'DELETE':
            console.log("delete ID:", id);
            try {
                const feature = await prisma.feature.delete({
                    where: { id: parseInt(id) },
                });
                res.status(200).json(feature);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
            break;
    }
}
