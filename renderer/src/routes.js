import * as trpc from '@trpc/server';
import { z } from 'zod';

const appRouter = trpc.router().query('hello', {
    input: z
        .object({
            text: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    resolve({ input }) {
        return {
            greeting: `Hello ${input?.text ?? 'world'}!`,
        };
    },
});

export { appRouter };