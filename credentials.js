import { getSession } from 'next-auth/react';
import clientPromise from '../../../../lib/mongodb';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export default async function signin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const client = await clientPromise;
    await client.connect();

    const db = client.db('ChatGM');

    const user = await db.collection('users').findOne({ username });

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordsMatch = await compare(password, user.password);

    if (!passwordsMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const session = await getSession({ req });

    if (session) {
        return res.status(400).json({ message: 'You are already signed in' });
    }

    const sessionData = {
        user: {
            id: user._id.toString(),
            username: user.username,
        },
    };

    const newSession = await createSession(sessionData, db);

    console.log("SESSION:", newSession);
    return res.status(200).json({ message: 'Sign in successful', session: newSession, url: 'http://localhost:3000/' });
}

async function createSession(sessionData, db) {
    const session = {
        user: {
            id: sessionData.user.id,
            username: sessionData.user.username,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await db.collection('sessions').insertOne(session);

    const token = sign({ id: result.insertedId.toString() }, process.env.JWT_SECRET);

    return {
        id: result.insertedId.toString(),
        token,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}
