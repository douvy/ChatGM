// trpc/conversations.ts
import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
// import { trpc } from '../../utils/trpc'
import { z } from 'zod';
import pusher from '../../server/lib/pusher';

export const authenticate = trpc.procedure.input((req: any) => {
  return req;
}).query(async ({ input }) => {
  console.log("INPUT:", input);
  const { socketId, channelName } = input;
  const auth = pusher.authorizeChannel(socketId, channelName);
  console.log("auth:", auth)
  return auth;
})

export const pusherRouter = router({
  authenticate: authenticate,
});