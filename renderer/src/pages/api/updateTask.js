import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function updateTask(req, res) {
    try {
        const client = await clientPromise;
        await client.connect();
        const db = client.db('ChatGM');
        const { _id, name, complete } = req.body;
        const filter = { _id: new ObjectId(_id) };
        const update = { name, complete };
        await db.collection('tasks').updateOne(filter, { $set: update });
        console.log(update);
        console.log(_id);
        res.status(200).json({ message: 'task updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}