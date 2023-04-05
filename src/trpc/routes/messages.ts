import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
import { z } from 'zod';
import pusher from '../../server/lib/pusher';

export const query = trpc.procedure.input((req: any) => {
    return req;
}).query(async ({ input }) => {
    const messages =
        await prisma.message.findMany(input);
    console.log("fetched trpc messages");
    return messages;
})

export const createMessage = trpc.procedure.input((req: any) => {
    return req;
}).query(async ({ input }) => {
    const message = await prisma.message.create({ data: input });

    const conversation = await prisma.conversation.findUnique({ where: { id: Number(message.conversationId) }, include: { messages: { orderBy: { id: 'asc' } } } });
    pusher.trigger(`conversation-${conversation?.id}`, "new-message", {
        conversation: conversation
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
    }),
).mutation(async ({ input }) => {
    const { id, starred } = input;
    // Here some login stuff would happen
    console.log("mutating:", id, starred);
    const message = await prisma.message.update({
        where: { id: Number(id) },
        data: { starred },
    });
    console.log("updatedMessage", message);
    return {
        message: message
    };
});

export const messagesRouter = router({
    query: query,
    create: createMessage,
    // get: get,
    update: update,
    // delete: deleteMessage,
    // starred: starred,
});