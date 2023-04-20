import clientPromise from '../../lib/mongodb';
import mongoose from "mongoose";

export default async function addFeature(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }

    const { name, description } = req.body;

    // Connect to MongoDB
    const client = await clientPromise;
    await client.connect();

    const db = client.db('ChatGM');

    // Create a new feature object
    // const feature = new mongoose.Schema({
    //     name: String,
    //     description: String
    // });

    // Save the feature to the database
    const savedFeature = await db.collection('features').insertOne({ name, description });

    // Return the saved feature
    res.status(200).json(savedFeature);
}
