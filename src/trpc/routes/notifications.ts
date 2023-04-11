import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance';
import { router } from '../../server/trpc';
import { z } from 'zod';

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

export const notificationsRouter = router({
  create: create
});
