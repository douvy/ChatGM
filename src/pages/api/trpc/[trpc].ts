// import { createNextApiHandler } from '@trpc/server/adapters/next';
// import { appRouter } from '../../../routes';
// import { createContext } from '../../../context';
// import { nextTRPC } from 'next-trpc'
// import { Context, trpc } from '../../../trpc/instance'
// import { conversations } from '../../../trpc/routes/conversations'

// export const router = trpc.router({
//   conversations,
// })

// export type Router = typeof router

// export default nextTRPC({
//   createContext,
//   // @ts-ignore
//   router,
// })

// import * as trpcNext from '@trpc/server/adapters/next';
// import { appRouter } from '../../../server/routers/_app';

// // export API handler
// // @see https://trpc.io/docs/api-handler
// export default trpcNext.createNextApiHandler({
//   router: appRouter,
//   createContext: () => ({}),
// });

// import * as trpc from '@trpc/server';
// import * as trpcNext from '@trpc/server/adapters/next';
// import { z } from 'zod';
// export const appRouter = trpc.router().query('hello', {
//   input: z
//     .object({
//       text: z.string().nullish(),
//     })
//     .nullish(),
//   resolve({ input }) {
//     return {
//       greeting: `hello ${input?.text ?? 'world'}`,
//     };
//   },
// });
// // export type definition of API
// export type AppRouter = typeof appRouter;
// // export API handler
// export default trpcNext.createNextApiHandler({
//   router: appRouter,
//   createContext: () => null,
// });

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
import { getToken } from "next-auth/jwt"
// import { Session } from '../../../types/next-auth'

function getSessionTokenFromCookies(cookies: string) {
  const cookieArray = cookies.split('; ');

  for (const cookie of cookieArray) {
    const [name, value] = cookie.split('=');
    if (name === 'next-auth.session-token') {
      return value;
    }
  }

  return null;
}

export async function createContext(opts: CreateNextContextOptions) {
  console.log("opts.request", opts.req.headers);
  console.log('cookie:', opts.req.headers.cookie);
  const cookie = opts.req.headers.cookie;
  const { req } = opts;
  const { secret } = authOptions.jwt;
  console.log("secret", secret);
  let session;;
  if (cookie) {
    session = await getToken({ req, secret });
    console.log("session in context", session);

  }
  return {
    session: session as {
      user: {
        id: number,
      },
    }
  }
}

// const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

// export API handler
// @see https://trpc.io/docs/api-handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
})