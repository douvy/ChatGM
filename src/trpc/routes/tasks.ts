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
    console.log('input:', input);
    const { projectId, content, id, project, projectOwnerId } = input;
    console.log(projectId, content, id, project);
    const existingRecord = await prisma.task.findFirst({
      where: { name: content, projectId: projectId }
    });
    if (existingRecord) return existingRecord;

    if (!(await prisma.project.findUnique({ where: { id: projectId } }))) {
      let insertedProject = await prisma.project.create({
        data: { id: projectId, name: project.name, ownerId: session.user.id }
      });
    }

    const task = await prisma.task.create({
      data: {
        id: id,
        name: content,
        projectId: projectId
      }
    });
    return task;
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

    const project = await prisma.task.update({
      where: {
        id: id
      },
      data: data
    });
    return project;
  });

export const query = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .query(async ({ ctx, input }) => {
    const user = ctx.session.user;
    const tasks = await prisma.task.findMany({
      where: {
        projectId: input.projectId
      }
    });
    return tasks;
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
  });

export const deleteTask = trpc.procedure
  .input(req => {
    return req;
  })
  .mutation(async ({ input }) => {
    const id = input as string;
    console.log('Task to delete:', id);

    return await prisma.task.delete({ where: { id } });
  });

export const tasksRouter = router({
  create: create,
  get: get,
  query: query,
  update: update,
  delete: deleteTask
});
