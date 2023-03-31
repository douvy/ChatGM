import { MongoClient } from 'mongodb';

export default async function getFeatures(req, res) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('ChatGM');
    const collection = db.collection('features');
    const features = await collection.find().toArray();
    res.status(200).json(features);
    client.close();
}