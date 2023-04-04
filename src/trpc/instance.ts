import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { createInstance } from 'next-trpc'

export type Context = {
    prisma: PrismaClient
    req: NextApiRequest
    res: NextApiResponse
}

export const trpc = createInstance<Context>()