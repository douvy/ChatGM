const { MongoClient, ServerApiVersion } = require('mongodb');
const BSON = require('bson');
const uri = "mongodb+srv://chatgm:chatgmiscool@chatgm.aqaulgo.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
import { ObjectId } from 'mongodb';

async function saveConversation(conversation) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client.connect();

        const db = client.db('ChatGM');
        const conversations = db.collection('conversations');

        let id;

        if (conversation._id) {
            // If _id exists, update the existing conversation
            const result = await conversations.updateOne({ _id: new ObjectId(conversation._id) }, { $set: conversation });
            console.log(result);
            if (result.modifiedCount === 1) {
                id = conversation._id;
            }
        } else {
            // If _id doesn't exist, insert a new conversation
            const result = await conversations.insertOne(conversation);
            id = result.insertedId;
        }

        client.close();

        return id;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await client.close();
    }
}

async function loadConversations() {
    await client.connect();

    const db = client.db('ChatGM');
    const conversations = db.collection('conversations');
    var cursor = await conversations.find();
    const documents = await cursor.toArray();
    return documents;
}


export { saveConversation, loadConversations }