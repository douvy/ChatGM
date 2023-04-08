// utils/sessionMiddleware.ts
// import { TRPCNextContext } from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react'; // or another session management library

export async function sessionMiddleware(ctx: any) {
  const req = ctx.req;
  const session = await getSession({ req });

  if (!session) {
    throw new Error('Not authenticated');
  }

  // Attach the session to the context so it can be accessed in procedures
  ctx.session = session;
}