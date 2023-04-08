import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { createInstance } from 'next-trpc'
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { Session } from 'next-auth';

export type Context = {
    prisma: PrismaClient
    req: NextApiRequest
    res: NextApiResponse
    // session: Session | null
}

export const trpc = createInstance<Context>()