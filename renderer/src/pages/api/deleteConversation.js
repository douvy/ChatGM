import { MongoClient, ObjectId } from 'mongodb';

export default async function deleteConversation(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).end(); // Method Not Allowed
    }

    const { id } = req.query;
    console.log("ID:", id);

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('ChatGM');
        const result = await db.collection('conversations').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(204).end(); // No Content
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
