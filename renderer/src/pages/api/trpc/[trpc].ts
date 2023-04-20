import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { authOptions } from '../auth/[...nextauth]';
import jwt, { Secret } from 'jsonwebtoken';
import { UrlWithStringQuery } from 'url';
import { getToken } from 'next-auth/jwt';
// import { Session } from '../../../types/next-auth'
import { client } from '../../../trpc/client';
import type { TRPCClient } from '@trpc/react';
import type { AppRouter } from '../../../server/routers/_app';

interface Session {
  user: {
    id: number;
  };
}

interface Context {
  session: Session;
  client: TRPCClient<AppRouter>;
}

export async function createContext(
  opts: CreateNextContextOptions
): Promise<any> {
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
    },
    client: client
  };
}

// const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

// export API handler
// @see https://trpc.io/docs/api-handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext
});
