import { prisma } from '../../utils/prismaSingleton';
import { trpc } from '../instance';
import { router } from '../../server/trpc';
import { z } from 'zod';
import { procedure } from '../../server/trpc';
import { transformDocument } from '@prisma/client/runtime';

export const create = trpc.procedure
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ input }) => {
    console.log('Input:', input);
    // add a notification object to the database with the passed sender, recipient, conversation id, and type
    const { senderId, recipientId, conversationId, type } = input;
    const notification = await prisma.notification.create({
      data: {
        sender: {
          connect: {
            id: senderId
          }
        },
        recipient: {
          connect: {
            id: recipientId
          }
        },
        conversation: {
          connect: {
            id: conversationId
          }
        },
        type: type
      }
    });
    return notification;
  });

export const get = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .query(async ({ ctx, input }) => {
    const session = ctx.session;
    const user = session.user;
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id,
        viewed: false
      },
      select: {
        id: true,
        sender: true,
        recipient: true,
        type: true,
        createdAt: true,
        conversation: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return notifications;
  });

export const notificationsRouter = router({
  create: create,
  get: get
});
