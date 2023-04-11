import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';
// import { Context } from '../../../trpc/instance';
import type { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '@utils/prismaSingleton';
import { initTRPC, TRPCError } from '@trpc/server';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import jwt, { Secret } from 'jsonwebtoken';
import { UrlWithStringQuery } from 'url';
import { getToken } from 'next-auth/jwt';
// import { Session } from '../../../types/next-auth'

export async function createContext(opts: CreateNextContextOptions) {
  // console.log("opts.request.headers", opts.req.headers);
  // console.log('cookie:', opts.req.headers.cookie);
  const cookie = opts.req.headers.cookie;
  const { req } = opts;
  const { secret } = authOptions.jwt;
  let session;
  if (cookie) {
    session = await getToken({ req, secret });
    console.log('createContext.session.keys:', Object.keys(session || {}));
  }
  return {
    session: session as {
      user: {
        id: number;
      };
    }
  };
}

// const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

// export API handler
// @see https://trpc.io/docs/api-handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext
});
