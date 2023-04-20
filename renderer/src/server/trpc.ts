import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { createContext } from '../pages/api/trpc/[trpc]';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
