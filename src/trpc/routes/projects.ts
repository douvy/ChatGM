import { prisma } from '../../utils/prismaSingleton';
import { trpc } from '../instance';
import { router } from '../../server/trpc';
import { z } from 'zod';
import { procedure } from '../../server/trpc';

export const create = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const session = ctx.session;
    const user = session.user;
    const { name, id } = input;
    const existingRecord = await prisma.project.findFirst({
      where: { name: name, ownerId: session.user.id }
    });
    if (existingRecord) return existingRecord;

    const project = await prisma.project.create({
      data: {
        id: id,
        name: name,
        ownerId: session.user.id
      }
    });
    return project;
  });

export const update = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const session = ctx.session;
    const user = session.user;
    const { id, ...data } = input;

    const project = await prisma.project.update({
      where: {
        id: id
      },
      data: data
    });
    return project;
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
    const { id } = input;
    const session = ctx.session;
    const user = session.user;
    return await prisma.project.findUnique({
      where: {
        id: id
      }
    });
  });

export const projectsRouter = router({
  create: create,
  get: get,
  update: update
});
