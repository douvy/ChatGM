import { z } from 'zod';
import { procedure, router } from '../trpc';
import { conversationsRouter } from '../../trpc/routes/conversations';
import { messagesRouter } from '../../trpc/routes/messages';
import { usersRouter } from '../../trpc/routes/users';
import { openaiRouter } from '../../trpc/routes/openai';
import { pusherRouter } from '../../trpc/routes/pusher';
import { notificationsRouter } from '../../trpc/routes/notifications';
import { projectsRouter } from '../../trpc/routes/projects';
import { tasksRouter } from '../../trpc/routes/tasks';

export const appRouter = router({
  conversations: conversationsRouter,
  messages: messagesRouter,
  users: usersRouter,
  openai: openaiRouter,
  pusher: pusherRouter,
  notifications: notificationsRouter,
  projects: projectsRouter,
  tasks: tasksRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
