import clientPromise from '../../lib/mongodb';
import mongoose from "mongoose";

export default async function addTask(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }

    const { name, description } = req.body;

    // Connect to MongoDB
    const client = await clientPromise;
    await client.connect();

    const db = client.db('ChatGM');

    const savedTask = await db.collection('tasks').insertOne({ name });

    res.status(200).json(savedTask);
}
