// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { loadConversations } from '../../utils/db'
import { ObjectId } from 'mongodb';

export default async function getConversations(
    req: NextApiRequest,
    res: NextApiResponse<any[]>
) {
    var conversations = await loadConversations();

    res.status(200).json(conversations);
}