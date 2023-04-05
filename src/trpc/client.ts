// // import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
// // import type nextTRPC from '../pages/api/trpc/[trpc]';

// // const client = createTRPCProxyClient<nextTRPC>({
// //   links: [
// //     httpBatchLink({
// //       url: 'http://localhost:3000/trpc',

// //       // You can pass any HTTP headers you wish here
// //       async headers() {
// //         return {
// //           authorization: getAuthCookie(),
// //         };
// //       },
// //     }),
// //   ],
// // });

// import { createClient } from 'next-trpc/client'
// import { createClient as createReactClient } from 'next-trpc/react'

// // import { Router } from '../pages/api/trpc/[trpc]'

// // @ts-ignore
// export const trpc = createReactClient<Router>({
// })

// // @ts-ignore
// export const client = createClient<Router>({})

// export default trpc

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';
import getBaseUrl from '../utils/getBaseUrl';

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     // authorization: getAuthCookie(),
      //   };
      // },
    }),
  ],
});