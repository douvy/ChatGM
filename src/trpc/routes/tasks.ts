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
    const { projectId, content, id, project, projectOwnerId, prevTaskId } =
      input;
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
        projectId: projectId,
        prevTaskId: prevTaskId
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

    const task = await prisma.task.update({
      where: {
        id: id
      },
      data: data
    });
    return task;
  });

export const postpone = procedure
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
    const { taskId, projectName } = input;

    let date = new Date(Date.parse(projectName));
    const newProjectName = new Date(
      date.setDate(date.getDate() + 1)
    ).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const project = await prisma.project.findFirst({
      where: {
        name: newProjectName
      }
    });

    const task = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        projectId: project?.id
      }
    });
    return task;
  });

export const updateSwapped = procedure
  .input((req: any) => req)
  .mutation(async ({ input }) => {
    const tasks = input;
    tasks.forEach(async (task: any) => {
      const { id, prevTaskId, ...data } = task;
      console.log(id, prevTaskId);
      const updatedTask = await prisma.task.update({
        where: {
          id: id
        },
        data: {
          prevTaskId
        }
      });
      console.log(updatedTask);
    });
  });

export const updateWhere = procedure
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
    const { where, data } = input;

    const task = await prisma.task.updateMany({
      where: where,
      data: data
    });
    return task;
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

export const queryRawSorted = procedure
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
    const { projectId } = input;
    const tasks = await prisma.$queryRaw`WITH RECURSIVE evt(id) AS (
      SELECT
          id,
          "projectId",
          "prevTaskId"
      FROM "Task"
      WHERE "prevTaskId" IS NULL AND "projectId" = ${projectId}
      UNION
      SELECT
          t.id,
          t."projectId",
          t."prevTaskId"
      FROM "Task" t
      JOIN evt ON (t."prevTaskId" = evt.id)
      )
      SELECT * FROM evt`;
    console.log('tasks', tasks);
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
  queryRawSorted: queryRawSorted,
  update: update,
  updateSwapped: updateSwapped,
  updateWhere: updateWhere,
  delete: deleteTask,
  postpone: postpone
});
