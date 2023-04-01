import { MongoClient, ObjectId } from 'mongodb';

export default async function updateConversationName(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).end(); // Method Not Allowed
    }

    const { _id, name } = req.body;
    console.log("idddd:", _id, name);

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('ChatGM');
        const result = await db.collection('conversations').findOneAndUpdate(
            { _id: new ObjectId(_id) },
            { $set: { name } },
            { returnDocument: 'after' }
        );
        console.log("result", result);

        if (!result.value) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(200).json(result.value);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
