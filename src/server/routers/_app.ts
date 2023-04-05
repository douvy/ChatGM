import { z } from 'zod';
import { procedure, router } from '../trpc';
import { conversationsRouter } from '../../trpc/routes/conversations'
import { messagesRouter } from '../../trpc/routes/messages'
import { openaiRouter } from '../../trpc/routes/openai'
import { pusherRouter } from '../../trpc/routes/pusher'

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => {
      console.log("INPUT!!!:", input);
      return {
        greeting: `hello ${input.text}`,
      };
    }),
  conversations: conversationsRouter,
  messages: messagesRouter,
  openai: openaiRouter,
  pusher: pusherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
