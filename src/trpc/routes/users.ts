// trpc/conversations.ts
import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
// import { trpc } from '../../utils/trpc'
import { z } from 'zod';
import pusher from '../../server/lib/pusher';
import { procedure } from '../../server/trpc'

export const get = trpc.procedure.input(
  z.object({
    id: z.union([z.number(), z.undefined()]),
  }),
).query(async ({ input }) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(input.id) },
    select: {
      id: true,
      username: true,
      avatarSource: true,
      includeTaskFeature: true,
      todoistApiKey: true,
      useGPT4: true,
      gpt4ApiKey: true,
      activeTaskId: true,
    },
  });
  return user;
})

export const update = trpc.procedure.input((req: any) => {
  if (!req.id) {
    throw new Error(`Users without an id property can't be updated"`);
  }
  return req;
}).query(async ({ input }) => {
  const user = input;
  return await prisma.user.update({
    where: { id: user.id },
    data: user,
  });
})

export const setActiveTask = procedure.use(({ next, ctx }) => {
  return next({
    ctx: ctx
  });
}).input((req: any) => {
  return req;
}).mutation(async ({ ctx, input }) => {
  const { session } = ctx;
  const activeTaskId = input;
  const user = ctx.session.user;
  console.log("user:", user);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      activeTaskId: activeTaskId
    },
    select: {
      activeTaskId: true,
    }
  });
  console.log("updatedUser:", updatedUser);
  return updatedUser;
})

export const usersRouter = router({
  get: get,
  update: update,
  setActiveTask: setActiveTask,
});