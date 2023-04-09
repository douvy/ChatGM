// trpc/conversations.ts
import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
// import { trpc } from '../../utils/trpc'
import { z } from 'zod';
import pusher from '../../server/lib/pusher';
import { getSession } from 'next-auth/react';
import { procedure } from '../../server/trpc'

export const query = trpc.procedure.query(async () => {
  const conversations =
    await prisma.conversation.findMany();
  console.log('\x1b[31m%s\x1b[0m', "conversations", conversations);
  return conversations
})

export const withPartialMessages = trpc.procedure.use(({ next, ctx }) => {
  console.log('fucking context', ctx);
  return next({
    ctx: ctx
  });
}).input((req: any) => {
  return req;
}).query(async ({ input }) => {
  const conversations = await prisma.conversation.findMany({
    ...input,
    include: {
      messages: {
        include: {
          sender: {
            select: {
              username: true,
              avatarSource: true
            }
          },
        },
        orderBy: { id: 'desc' }, // Order messages by id in ascending order
        take: 10 // Fetch only the last 10 messages for each conversation
      },
      participants: {
        select: {
          id: true,
          username: true,
          avatarSource: true
        }
      },
    },
  });
  return conversations.map((conversation: any) => {
    return {
      ...conversation,
      messages: conversation.messages.reverse() // Reverse the messages so that they are in ascending order
    }
  });
  console.log('\x1b[31m%s\x1b[0m', "conversations", conversations);
  return conversations
})

export const createConversation = trpc.procedure.input((req: any) => {
  console.log('\x1b[31m%s\x1b[0m', "inserting....", req);
  if (req.id) {
    throw new Error(`New conversations can't be made when an id property is passed"}`);
  }
  return req;
}).query(async ({ input }) => {
  console.log("INPUT:", input);
  const { messages, name, ownerId, creatorId } = input;
  const conversation = await prisma.conversation.create({
    data: {
      messages: {
        createMany: {
          data: messages,
        },
      },
      participants: {
        connect: {
          id: creatorId
        }
      },
      name: name,
      ownerId: ownerId,
      creatorId: creatorId,
    },
    include: {
      messages: { orderBy: { id: 'asc' } },
      participants: true,
    },
  });
  console.log('\x1b[31m%s\x1b[0m', "inserted", conversation);
  pusher.trigger(`conversation-${conversation?.id}`, "new-message", {
    conversation: conversation
  });
  return conversation;
})

export const get = trpc.procedure.input(
  z.object({
    id: z.union([z.number(), z.undefined()]),
  }),
).query(async ({ input }) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(input.id) }, include: {
      messages: { orderBy: { id: 'asc' } },
      participants: true,
    }
  });
  console.log("conversation with participants:", conversation)
  return conversation;
})

export const update = trpc.procedure.input((req: any) => {
  console.log('\x1b[31m%s\x1b[0m', "inserting....", req);
  if (!req.id) {
    throw new Error(`Conversations without an id property can't be updated"`);
  }
  return req;
}).query(async ({ input }) => {
  const conversation = input;
  return await prisma.conversation.update({
    where: { id: conversation.id },
    data: conversation,
    include: { messages: { orderBy: { id: 'asc' } } },
  });
})

export const updateName = trpc.procedure.input((req: any) => {
  console.log('\x1b[31m%s\x1b[0m', "inserting....", req);
  if (!req.id) {
    throw new Error(`Conversations without an id property can't be updated"`);
  }
  return req;
}).mutation(async ({ input }) => {
  const conversation = input;
  console.log("updatedConversation:", conversation);
  const updatedConversation = await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      name: conversation.name,
    },
    include: { messages: { orderBy: { id: 'asc' } } },
  });
  console.log(updatedConversation)
  return updatedConversation;
})

export const updateMessages = trpc.procedure.input((req: any) => {
  console.log('\x1b[31m%s\x1b[0m', "inserting....", req);
  if (!req.id) {
    throw new Error(`Conversations without an id property can't be updated"`);
  }
  return req;
}).mutation(async ({ input }) => {
  const conversation = input;
  const updatedConversation = await prisma.conversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      messages: {
        deleteMany: {
          NOT: {
            id: {
              in: conversation.messages.map((message: any) => message.id),
            },
          },
        },
      },
    },
    include: {
      messages: true,
    },
  });
  console.log("updatedConversation:", updatedConversation);
  return updatedConversation;
})

export const addParticipant = procedure.use(({ next, ctx }) => {
  return next({
    ctx: ctx
  });
}).input(
  z.object({
    conversationId: z.number(),
    participantUsername: z.string(),
  }),
).mutation(async ({ ctx, input }) => {
  // console.log("headers:", ctx.req.headers);
  // const session = await getSession({ req: ctx.req });
  const { conversationId, participantUsername } = input;
  const { session } = ctx;
  console.log(ctx.session);
  console.log(session);
  if (!session) throw new Error("Not authenticated");
  if (!session.user) throw new Error("No user on session");
  const conversation = await prisma.conversation.update({
    where: {
      ownedConversation: {
        id: conversationId,
        ownerId: session.user.id,
      }
    },
    data: {
      participants: {
        connect: {
          username: participantUsername
        }
      }
    }
  });

  return conversation;
})

export const deleteConversation = trpc.procedure.input((req) => {
  return req;
}).mutation(async ({ input }) => {
  const id = input as number;
  console.log("conversation to delete:", id);

  return await prisma.conversation.delete({ where: { id } });
});

export const conversationsRouter = router({
  query: query,
  withPartialMessages: withPartialMessages,
  create: createConversation,
  get: get,
  update: update,
  updateName: updateName,
  updateMessages: updateMessages,
  addParticipant: addParticipant,
  delete: deleteConversation,
});