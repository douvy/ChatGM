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

// export API handler
// @see https://trpc.io/docs/api-handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});