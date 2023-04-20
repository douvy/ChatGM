import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
import { z } from 'zod';
import pusher from '../../server/lib/pusher';
import { procedure } from '../../server/trpc'

export const query = trpc.procedure.input((req: any) => {
    return req;
}).query(async ({ input }) => {
    const messages =
        await prisma.message.findMany(input);
    console.log("fetched trpc messages");
    return messages;
})

export const starred = procedure.use(({ next, ctx }) => {
    return next({
        ctx: ctx
    });
}).input((req: any) => {
    return req;
}).query(async ({ ctx, input }) => {
    const { session } = ctx;
    // if (!session) throw new Error("Not authenticated");
    // if (!session.user) throw new Error("No user on session");
    const starredMessages = await prisma.message.findMany({
        where: {
            fans: {
                some: { id: input.userId }
            }
        },
        include: {
            sender: true
        }
    });
    console.log("starredMessages:", starredMessages);
    return starredMessages;
})



export const createMessage = trpc.procedure.input((req: any) => {
    return req;
}).mutation(async ({ input }) => {
    const message = await prisma.message.create({ data: input });

    const conversation = await prisma.conversation.findUnique({ where: { id: Number(message.conversationId) }, include: { messages: { orderBy: { id: 'asc' } } } });
    pusher.trigger(`conversation-${conversation?.id}`, "new-message", {
        conversationId: conversation?.id,
        message: conversation?.messages[conversation?.messages.length - 1]
    });
    return conversation;
})

// export const get = trpc.procedure.input(
//     z.object({
//         id: z.number() || undefined,
//     }),
// ).query(async ({ input }) => {
//     const message = await prisma.message.findUnique({ where: { id: Number(input.id) }, include: { messages: true } });
//     return message;
// });

export const update = trpc.procedure.input(
    z.object({
        id: z.number() || undefined,
        starred: z.boolean(),
        content: z.string() || undefined,
    }),
).mutation(async ({ input }) => {
    const { id, ...params } = input;
    // Here some login stuff would happen
    // console.log("mutating:", id, starred);
    const message = await prisma.message.update({
        where: { id: Number(id) },
        data: { ...params },
    });
    console.log("updatedMessage", message);
    return {
        message: message
    };
});

export const messagesRouter = router({
    query: query,
    starred: starred,
    create: createMessage,
    // get: get,
    update: update,
    // delete: deleteMessage,
    // starred: starred,
});