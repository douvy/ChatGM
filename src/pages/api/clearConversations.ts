// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteConversations } from '../../utils/db'
import { ObjectId } from 'mongodb';

export default async function clearConversations(
    req: NextApiRequest,
    res: NextApiResponse<boolean>
) {
    var response = await deleteConversations();
    console.log(response);


    res.status(200).json(response.acknowledged);
}