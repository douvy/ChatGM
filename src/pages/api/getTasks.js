import { MongoClient } from 'mongodb';

export default async function getTasks(req, res) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('ChatGM');
    const collection = db.collection('tasks');
    const tasks = await collection.find().toArray();
    res.status(200).json(tasks);
    client.close();
}