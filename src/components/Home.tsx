import Head from 'next/head';
import { Inter } from 'next/font/google';
import React, { useState, useEffect, useRef, SetStateAction } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ChatWindow from '../components/ChatWindow';
import SavedMessages from '../components/SavedMessages';
import FeaturesView from '../components/FeaturesView';
import Tasks from '../components/Tasks';
import Notepad from '../components/Notepad';
import ConversationsView from '../components/ConversationsView';
import MyAccount from '../components/MyAccount';
import Topbar from '../components/Topbar';
import Debugger from '../components/Debugger';
import Modal from '../components/Modal';
import ActiveTask from '../components/ActiveTask';
import NewTask from '../components/NewTask';
import Table from '@components/Table';
import { addInfiniteScroll } from '../utils/infiniteScroll';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { User, Conversation as PrismaConversation } from '@prisma/client';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import { Conversation, Message, Session, PageProps } from '../interfaces';
import { TodoistApi } from '@doist/todoist-api-typescript';
import Block from '../components/Block';

const Home: NextPage<PageProps> = props => {
  const { data: session, status } = useSession();
  const user = session?.user as User;

  const router = useRouter();
  const [componentName, setComponentName] = useState('');
  const path = router.asPath;

  const trpcCtx = trpc.useContext();

  if (status === 'authenticated') {
  }

  const [content, setContent] = useState<any>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [currentRoute, setCurrentRoute] = useState('/');

  const [messages, setMessages] = useState<Message[]>([]);

  const [starredMessages, setStarredMessages] = useState<Message[]>(
    props.starredMessages || []
  );

  const [conversationId, setConversationId] = useState<number | undefined>();

  const [messageContent, setMessageContent] = useState('');

  const [tasks, setTasks] = useState<any>(props.tasks || []);
  const [activeProject, setActiveProject] = useState<any>(undefined);

  const [newMessage, setMessage] = useState<Message>({
    role: 'user',
    content: messageContent,
    avatarSource: 'avatar.png',
    // sender: session?.user as User,
    senderId: session?.user?.id || 0
  });

  const [referencedMessage, setReferencedMessage] = useState<
    Message | undefined
  >(undefined);

  const [newResponse, setResponse] = useState({
    response: ''
  });

  const [userInfo, setUserInfo] = useState<any>(
    {
      ...props.userInfo,
      update: (props: any) => client.users.update.mutate(props)
    } || []
  );

  const [conversation, setConversation] = useState<Conversation>({
    name: '',
    messages: messages,
    isActive: false,
    ownerId: userInfo.id,
    creatorId: userInfo.id,
    isPublic: false
  });

  const [conversations, setConversations] = useState<Conversation[]>(
    props.conversations || []
  );

  const [activeTask, setActiveTask] = useState<any>(props.activeTask);

  const [settings, setSettings] = useState<any>({
    tasksPerRow: 6
  });

  const [debuggerObject, setDebuggerObject] = useState<any>();

  const [isMobile, setIsMobile] = useState(false);

  const initialMount = useRef(true);

  const updateConversationMessagesMutation =
    trpc.conversations.updateMessages.useMutation();

  const [addingTask, setAddingTask] = useState(false);

  const [projects, setProjects] = useState<any>([]);

  const api = new TodoistApi(userInfo.todoistApiKey);

  useEffect(() => {
    api
      .getProjects()
      .then(projects => setProjects(projects))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    switch (router.pathname) {
      case '/conversations/[id]':
        const partialConversation = props.conversations.find((c: any) => {
          return c.id == router.query.id;
        });
        if (partialConversation && partialConversation.id != conversation.id)
          setConversation(partialConversation);
        setConversationId(Number(router.query.id));
        break;
    }

    if (isMobile) {
      setUserInfo({
        ...userInfo,
        hideSidebar: true
      });
    }
  }, [path]);

  useEffect(() => {
    if (props.userInfo.activeProjectId) {
      const api = new TodoistApi(props.userInfo.todoistApiKey);
      api.getProject(props.userInfo.activeProjectId).then(project => {
        setActiveProject(project);
      });
      api
        .getTasks({ projectId: props.userInfo.activeProjectId })
        .then(tasks => {
          setTasks(tasks);
        });
    }
  }, []);

  useEffect(() => {
    if (userInfo.activeTaskId && userInfo.activeTaskId != activeTask.id) {
      const api = new TodoistApi(userInfo.todoistApiKey);
      api.getTask(userInfo.activeTaskId).then(task => {
        setActiveTask(task);
      });
    }
  }, [userInfo]);

  useEffect(() => {
    if (path != '/' && router.pathname != '/conversations/[id]') {
      setConversationId(undefined);
    }
  }, [path]);

  useEffect(() => {
    if (conversationId) {
      if (
        conversationId != conversation.id ||
        !conversation.participants ||
        conversation.messages.length == 10
      ) {
        client.conversations.get.query({ id: conversationId }).then(data => {
          if (!data) return router.push('/', '/', { shallow: true });
          setConversation(data as Conversation);
        });
      }
      if (currentRoute != '/') {
        setCurrentRoute('/');
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversation != null) {
      setCurrentRoute('/');
    }

    if (!conversation?.id) {
      // don't add conversations without ids
      return;
    }

    // update conversations for sidebar
    let found = false;
    const updatedConversations = conversations.map(conv => {
      if (conv.id == conversation.id) {
        found = true;
        return conversation;
      }
      return conv;
    });
    if (!found) {
      setConversations([conversation, ...conversations]);
    } else {
      setConversations(updatedConversations);
    }
  }, [conversation]);

  useEffect(() => {
    setMessage({
      ...newMessage,
      senderId: session?.user?.id || 0
    });
  }, [session]);

  useEffect(() => {
    switch (props.c?.key) {
      case 'c':
        newConversation();
        break;
      case 'n':
        router.push('/notepad');
        break;
      case 'p':
        router.push('/prompts');
        break;
      case 'r':
        router.push('/savedResponses');
        break;
      case 's':
        router.push('/settings');
        break;
      case 't':
        router.push('/tasks');
        break;
      case 'N':
        path != '/tasks' && setAddingTask(true);
        break;
    }
  }, [props.c]);

  useEffect(() => {
    if (scrollContainer.current) {
      addInfiniteScroll(scrollContainer.current);
    }
  }, []);

  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollContainer.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  useEffect(() => {
    if (props.userInfo?.defaultHomepage && path == '/')
      router.push('/' + props.userInfo.defaultHomepage);
  }, []);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
    } else {
      userInfo.update({ hideSidebar: userInfo.hideSidebar });
    }
  }, [userInfo.hideSidebar]);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobileBreakpoint = 640;
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const newConversation = (e?: Event) => {
    e?.preventDefault();
    setConversation({
      messages: [],
      isActive: true,
      ownerId: userInfo.id,
      creatorId: userInfo.id,
      isPublic: false
    });
    setConversationId(undefined);
    router.push('/');
  };

  const lastMessage = useRef<HTMLDivElement>(null);

  const updateMessageValue = (event: any) => {
    setMessageContent(event.target.value);
    setMessage({ ...newMessage, content: event.target.value });
  };

  const appendMessage = (message: Message) => {
    conversation.messages.push(message);
    setConversation(conversation => ({
      ...conversation
    }));
  };

  const addSystemMessage = async (message: string) => {
    conversation.messages.push({
      role: 'system',
      content: message,
      avatarSource: 'avatar-chat-gray.png'
    });
    setConversation(conversation => ({
      ...conversation
    }));
    const updatedConversation =
      await updateConversationMessagesMutation.mutateAsync(conversation);
    setConversation(updatedConversation as Conversation);
    return updatedConversation;
  };

  const resetMessage = () => {
    setMessage({
      role: 'user',
      content: '',
      avatarSource: 'avatar.png',
      senderId: session?.user.id || 0
    });
  };

  const setPlaceholderMessage = (
    message: Message,
    conversation: Conversation
  ) => {
    setConversation({
      ...conversation,
      messages: [...conversation.messages, message]
    });
  };

  const addUserToConversation = async () => {
    let handle = newMessage.content.split(' ')[0].substring(1);
    resetMessage();
    let updatedConversation = await client.conversations.addParticipant.mutate({
      conversationId: conversation.id || -1, //it will never be undefined,
      participantUsername: handle
    });

    const userToAdd = await client.users.find.query({
      username: handle
    });

    updatedConversation = await addSystemMessage(
      `${userInfo.username} added ${newMessage.content
        .split(' ')[0]
        .substring(1)} to the conversation.`
    );
    const notification = await client.notifications.create.mutate({
      senderId: userInfo.id,
      recipientId: userToAdd?.id,
      conversationId: conversation.id,
      type: 'addedToConversation'
    });
    return updatedConversation;
  };

  const sendMessage = async () => {
    if (newMessage.content.startsWith('@') && conversation.id) {
      return addUserToConversation();
    }
    appendMessage(newMessage);
    resetMessage();
    var updatedConversation = conversation as PrismaConversation;
    var updatedConversations;
    if (!conversation.id) {
      updatedConversation = await client.conversations.create.mutate(
        conversation
      );
      setPlaceholderMessage(
        {
          role: 'systen',
          content: 'Generating name...',
          avatarSource: 'avatar-chat-gray.png'
        },
        updatedConversation as Conversation
      );
      // setConversations([updatedConversation as Conversation, ...conversations]);
      updatedConversation =
        (await client.openai.generateName.mutate(updatedConversation)) ||
        updatedConversation;
      // setConversations([updatedConversation as Conversation, ...conversations]);
      setConversation({
        ...conversation,
        name: updatedConversation.name || conversation.name
      });
    } else {
      updatedConversation = (await client.messages.create.mutate({
        ...newMessage,
        conversationId: conversation.id
      })) as PrismaConversation;
    }

    // Update the content value with the Font Awesome spinner icon
    setPlaceholderMessage(
      {
        role: 'assistant',
        content:
          '<i className="fa-duotone fa-2x fa-spinner fa-spin text-offwhite"></i>',
        avatarSource: 'avatar-chat.png'
      },
      updatedConversation as Conversation
    );

    updatedConversation = (await client.openai.query.mutate(
      updatedConversation
    )) as PrismaConversation;
    setConversation({
      ...(updatedConversation as Conversation),
      messages: (updatedConversation as Conversation).messages
    });
    // setConversations(conversations.map((c) => c.id == updatedConversation.id ? updatedConversation as Conversation : c));
    if (!conversationId) {
      setConversationId(updatedConversation.id);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setConversation(conversation);
    setConversationId(conversation.id);
    if (isMobile) {
      setUserInfo({
        ...userInfo,
        hideSidebar: true
      });
    }
  };

  const updateConversations = (
    updatedConversation: Conversation,
    index: number
  ) => {
    const updatedConversations = [...conversations];
    updatedConversations[index] = updatedConversation;
  };

  const [activeComponent, setActiveComponent] = useState<any>();
  console.log('home');
  return (
    <>
      <div className='flex h-full' id='main-container'>
        {/* <Block>dkfsdkjfhskjdh</Block> */}
        {/* <Table /> */}
        {true && (
          <Sidebar
            conversations={conversations}
            setConversations={setConversations}
            conversation={conversation}
            conversationId={conversationId}
            setConversation={setConversation}
            setActiveComponent={setActiveComponent}
            features={props.features}
            activeConversation={conversation}
            activeConversationId={conversationId}
            selectConversation={selectConversation}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            newConversation={newConversation}
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
            c={props.c}
            isMobile={isMobile}
            style={{
              transition: 'z-20 opacity 0.3s ease-out, transform 0.3s ease-out',
              opacity: userInfo.hideSidebar ? 0.5 : 1,
              transform: userInfo.hideSidebar
                ? 'translateX(-100%)'
                : 'translateX(0)'
            }}
          />
        )}
        {userInfo.hideSidebar && (
          <MobileNav userInfo={userInfo} setUserInfo={setUserInfo} />
        )}
        <div
          className={`flex flex-col h-full w-full transition-all duration-300 ${
            userInfo.hideSidebar && !isMobile ? 'ml-[-225px]' : ''
          }`}
        >
          {userInfo.activeTaskId && (
            <ActiveTask
              activeTask={activeTask}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
            />
          )}
          <Topbar
            conversation={conversation}
            userInfo={userInfo}
            addSystemMessage={addSystemMessage}
            settings={settings}
            setSettings={setSettings}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            projects={projects}
            setProjects={setProjects}
          />
          {path != '/tasks' && (
            <div
              className={`fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center ${
                addingTask ? 'block' : 'hidden'
              }`}
            >
              <div className='w-1/5'>
                <NewTask
                  addingTask={addingTask}
                  setAddingTask={setAddingTask}
                  userInfo={userInfo}
                  activeProject={activeProject}
                  tasks={tasks}
                  setTasks={setTasks}
                  placeholder={'Add a task...'}
                ></NewTask>
              </div>
            </div>
          )}
          {modalOpen && (
            <Modal
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              children={<></>}
            />
          )}
          <main
            className={`${
              !userInfo.hideSidebar && 'container mx-auto'
            } flex-1 mt-0`}
          >
            {conversation &&
            (path == '/' || router.pathname == '/conversations/[id]') ? (
              <ChatWindow
                conversationId={conversationId}
                conversation={conversation}
                setConversation={setConversation}
                sendMessage={sendMessage}
                newMessage={newMessage}
                updateMessageValue={updateMessageValue}
                starredMessages={starredMessages}
                setStarredMessages={setStarredMessages}
                referencedMessage={referencedMessage}
                setReferencedMessage={setReferencedMessage}
                userInfo={userInfo}
              />
            ) : null}
            {path == '/features' ? (
              <FeaturesView passedFeatures={props.features}></FeaturesView>
            ) : null}
            {path == '/tasks' ? (
              <Tasks
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                tasks={tasks}
                setTasks={setTasks}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
                projects={projects}
                setProjects={setProjects}
                c={props.c}
                settings={settings}
              ></Tasks>
            ) : null}
            {path == '/notepad' ? (
              <Notepad
                content={content}
                setContent={setContent}
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                setDebuggerObject={setDebuggerObject}
                setActiveTask={setActiveTask}
              ></Notepad>
            ) : null}
            {path == '/features' ? (
              <FeaturesView passedFeatures={props.features}></FeaturesView>
            ) : null}
            {path == '/settings' ? (
              <MyAccount
                userInfo={userInfo}
                setUserInfo={setUserInfo}
              ></MyAccount>
            ) : null}
            {path == '/conversations' ? (
              <ConversationsView
                conversations={conversations}
                setConversations={setConversations}
              ></ConversationsView>
            ) : null}
            {/* {currentRoute == '/builder' ? <ComponentBuilder></ComponentBuilder> : null} */}
            {path == '/prompts' ? (
              <SavedMessages
                starredMessages={starredMessages}
                setStarredMessages={setStarredMessages}
                setReferencedMessage={setReferencedMessage}
                setConversationId={setConversationId}
                userInfo={userInfo}
                role='user'
              ></SavedMessages>
            ) : null}
            {path == '/savedResponses' ? (
              <SavedMessages
                starredMessages={starredMessages}
                setStarredMessages={setStarredMessages}
                setReferencedMessage={setReferencedMessage}
                setConversationId={setConversationId}
                userInfo={userInfo}
                role='assistant'
              ></SavedMessages>
            ) : null}
            {debuggerObject && <Debugger debuggerObject={debuggerObject} />}
            {userInfo.hideSidebar && !isMobile && (
              <i
                className={`fa-solid hidden-sm fa-arrow-right cursor-pointer text-gray w-5 h-5 mr-auto mb-3 ml-3 absolute bottom-0 left-0 transform transition duration-300 hover:scale-125 hover:font-bold`}
                onClick={e => setUserInfo({ ...userInfo, hideSidebar: false })}
              ></i>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
