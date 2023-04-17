// trpc/conversations.ts
import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance';
import { router } from '../../server/trpc';
// import { trpc } from '../../utils/trpc'
import { z } from 'zod';
import pusher from '../../server/lib/pusher';
import { procedure } from '../../server/trpc';
import { TodoistApi } from '@doist/todoist-api-typescript';
import { getSession } from 'next-auth/react';

export const query = trpc.procedure
  .input((req: any) => {
    return req;
  })
  .query(async ({ input }) => {
    const user = await prisma.user.findMany({
      select: input
    });
    return user;
  });

export const get = trpc.procedure
  .input(
    z.object({
      id: z.union([z.number(), z.undefined()])
    })
  )
  .query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { id: Number(input.id) },
      select: {
        id: true,
        username: true,
        avatarSource: true,
        includeTaskFeature: true,
        todoistApiKey: true,
        useGPT4: true,
        gpt4ApiKey: true,
        activeTaskId: true,
        activeTaskSetAt: true,
        activeProjectId: true,
        enableChatGMBot: true,
        telegramUserId: true,
        includeNotepad: true,
        defaultHomepage: true,
        hideSidebar: true,
        hideProjectHeader: true
      }
    });
    return user;
  });

export const find = trpc.procedure
  .input((req: any) => {
    return req;
  })
  .query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: input,
      select: {
        id: true,
        username: true,
        avatarSource: true,
        includeTaskFeature: true,
        todoistApiKey: true,
        useGPT4: true,
        gpt4ApiKey: true,
        activeTaskId: true,
        activeTaskSetAt: true,
        activeProjectId: true,
        enableChatGMBot: true,
        telegramUserId: true,
        includeNotepad: true,
        defaultHomepage: true,
        hideSidebar: true,
        hideProjectHeader: true
      }
    });
    return user;
  });

export const getUserInfo = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .query(async ({ ctx, input }) => {
    const { session } = input;
    console.log(input);
    const user = session.user;
    const userInfo = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: {
        id: true,
        username: true,
        avatarSource: true,
        includeTaskFeature: true,
        todoistApiKey: true,
        useGPT4: true,
        gpt4ApiKey: true,
        activeTaskId: true,
        activeTaskSetAt: true,
        activeProjectId: true,
        enableChatGMBot: true,
        telegramUserId: true,
        includeNotepad: true,
        defaultHomepage: true,
        hideSidebar: true,
        hideProjectHeader: true
      }
    });
    return userInfo;
  });

export const getInitialPageData = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .query(async ({ ctx, input }) => {
    const session = ctx.session || input.session;
    console.log('trpc.getInitialPageData.session.keys: ', Object.keys(session));
    const user = session.user;
    const userInfo = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: {
        id: true,
        username: true,
        avatarSource: true,
        includeTaskFeature: true,
        todoistApiKey: true,
        useGPT4: true,
        gpt4ApiKey: true,
        activeTaskId: true,
        activeTaskSetAt: true,
        activeProjectId: true,
        enableChatGMBot: true,
        telegramUserId: true,
        includeNotepad: true,
        defaultHomepage: true,
        hideSidebar: true,
        hideProjectHeader: true
      }
    });

    const activeTask =
      userInfo?.activeTaskId && userInfo?.todoistApiKey
        ? await (async () => {
            if (userInfo.todoistApiKey == null) return;
            if (userInfo.activeTaskId == null) return;
            const api = new TodoistApi(userInfo.todoistApiKey);
            return await api.getTask(userInfo.activeTaskId);
          })()
        : {};

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userInfo?.id
          }
        }
      },
      orderBy: { id: 'desc' },

      include: {
        messages: {
          include: {
            sender: {
              select: {
                username: true,
                avatarSource: true
              }
            }
          },
          orderBy: { id: 'desc' }, // Order messages by id in ascending order
          take: 10 // Fetch only the last 10 messages for each conversation
        },
        participants: {
          select: {
            id: true,
            username: true,
            avatarSource: true
          }
        }
      }
    });

    const props = {
      session: session,
      conversations: conversations.map((conversation: any) => {
        return {
          ...conversation,
          messages: conversation.messages.reverse() // Reverse the messages so that they are in ascending order
        };
      }),
      userInfo: userInfo,
      starredMessages: await prisma.message.findMany({
        where: {
          fans: {
            some: { id: session.user.id }
          }
        },
        include: {
          sender: true
        }
      }),
      activeTask: activeTask
    };
    console.log('trpc.getInitialPageData.props: ', props);
    return props;
  });

export const update = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    // if (!req.id) {
    //   throw new Error(`Users without an id property can't be updated"`);
    // }
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const user = session.user;
    const userInfo = input;
    return await prisma.user.update({
      where: { id: user.id },
      data: userInfo
    });
  });

export const updateAvatar = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const avatarSource = input;
    const user = session.user;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarSource: avatarSource
      },
      select: {
        avatarSource: true
      }
    });
    console.log('updatedUser:', updatedUser);
    return updatedUser;
  });

export const setActiveTask = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const activeTaskId = input;
    const user = ctx.session.user;
    console.log('user:', user);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        activeTaskId: activeTaskId,
        activeTaskSetAt: new Date()
      },
      select: {
        activeTaskId: true,
        activeTaskSetAt: true
      }
    });
    console.log('updatedUser:', updatedUser);
    return updatedUser;
  });

export const setActiveProject = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const activeProjectId = input;
    const user = ctx.session.user;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        activeProjectId: activeProjectId
      },
      select: {
        activeProjectId: true
      }
    });
    console.log('updatedUser:', updatedUser);
    return updatedUser;
  });

export const addStarredMessage = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input(
    z.object({
      messageId: z.number()
    })
  )
  .mutation(async ({ ctx, input }) => {
    // console.log("headers:", ctx.req.headers);
    // const session = await getSession({ req: ctx.req });
    const { messageId } = input;
    const { session } = ctx;
    if (!session) throw new Error('Not authenticated');
    if (!session.user) throw new Error('No user on session');
    const user = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        starredMessages: {
          connect: {
            id: messageId
          }
        }
      }
    });

    return user;
  });

export const saveNote = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const note = input;
    const user = ctx.session.user;
    if (!note.id) {
      const newNote = await prisma.note.create({
        data: {
          content: note.content,
          userId: user.id
        }
      });
      return newNote;
    } else {
      const updatedNote = await prisma.note.update({
        where: { id: note.id },
        data: {
          content: note.content
        },
        select: {
          id: true,
          content: true
        }
      });
      return updatedNote;
    }
  });

export const getNote = procedure
  .use(({ next, ctx }) => {
    return next({
      ctx: ctx
    });
  })
  .input((req: any) => {
    return req;
  })
  .query(async ({ ctx, input }) => {
    const { session } = ctx;
    const user = ctx.session.user;
    const note = await prisma.note.findUnique({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        content: true
      }
    });
    return note;
  });

export const usersRouter = router({
  query: query,
  get: get,
  find: find,
  getUserInfo: getUserInfo,
  getInitialPageData: getInitialPageData,
  update: update,
  updateAvatar: updateAvatar,
  setActiveTask: setActiveTask,
  setActiveProject: setActiveProject,
  addStarredMessage: addStarredMessage,
  saveNote: saveNote,
  getNote: getNote
});
