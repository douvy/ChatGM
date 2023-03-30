import clientPromise from '../../../lib/mongodb';
import { hash } from 'bcrypt';

export default async function signup(req, res) {
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

  const userExists = await db.collection('users').findOne({ username });

  if (userExists) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const hashedPassword = await hash(password, 10);

  const newUser = {
    username,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('users').insertOne(newUser);
  const insertedUserId = result.insertedId;

  const insertedUser = await db.collection('users').findOne({ _id: insertedUserId });
  return res.status(200).json({ message: 'Sign up successful', user: insertedUser });
}