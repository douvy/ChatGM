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
      activeTaskSetAt: true,
      enableChatGMBot: true,
      telegramUserId: true,
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

export const updateAvatar = procedure.use(({ next, ctx }) => {
  return next({
    ctx: ctx
  });
}).input((req: any) => {
  return req;
}).mutation(async ({ ctx, input }) => {
  const { session } = ctx;
  const avatarSource = input;
  const user = session.user;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      avatarSource: avatarSource
    },
    select: {
      avatarSource: true,
    }
  });
  console.log("updatedUser:", updatedUser);
  return updatedUser;
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
      activeTaskId: activeTaskId,
      activeTaskSetAt: new Date(),
    },
    select: {
      activeTaskId: true,
    }
  });
  console.log("updatedUser:", updatedUser);
  return updatedUser;
})

export const addStarredMessage = procedure.use(({ next, ctx }) => {
  return next({
    ctx: ctx
  });
}).input(
  z.object({
    messageId: z.number(),
  }),
).mutation(async ({ ctx, input }) => {
  // console.log("headers:", ctx.req.headers);
  // const session = await getSession({ req: ctx.req });
  const { messageId } = input;
  const { session } = ctx;
  if (!session) throw new Error("Not authenticated");
  if (!session.user) throw new Error("No user on session");
  const user = await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      starredMessages: {
        connect: {
          id: messageId
        }
      }
    }
  });

  return user;
})

export const usersRouter = router({
  get: get,
  update: update,
  updateAvatar: updateAvatar,
  setActiveTask: setActiveTask,
  addStarredMessage: addStarredMessage,
});