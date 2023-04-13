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

  const [userInfo, setUserInfo] = useState<any>(props.userInfo || []);

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

  const [debuggerObject, setDebuggerObject] = useState<any>(null);

  const updateConversationMessagesMutation =
    trpc.conversations.updateMessages.useMutation();

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
      case 'n':
        setCurrentRoute('/notepad');
        break;
      case 'p':
        setCurrentRoute('/savedPrompts');
        break;
      case 'r':
        setCurrentRoute('/savedResponses');
        break;
      case 'c':
        newConversation();
        break;
    }
  }, [path]);

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
      case 't':
        setCurrentRoute('/tasks');
        break;
      case 'n':
        setCurrentRoute('/notepad');
        break;
      case 'p':
        setCurrentRoute('/savedPrompts');
        break;
      case 'r':
        setCurrentRoute('/savedResponses');
        break;
      case 'c':
        newConversation();
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

  const lastMessage = useRef<HTMLDivElement>(null);

  const updateMessageValue = (event: any) => {
    setMessageContent(event.target.value);
    setMessage({ ...newMessage, content: event.target.value });
  };

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
    setCurrentRoute('/');
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
          '<i class="fa-duotone fa-2x fa-spinner fa-spin text-offwhite"></i>',
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
  };

  const updateConversations = (
    updatedConversation: Conversation,
    index: number
  ) => {
    const updatedConversations = [...conversations];
    updatedConversations[index] = updatedConversation;
  };

  const [activeComponent, setActiveComponent] = useState<any>();
  return (
    <>
      <div className='flex' id='main-container'>
        {/* <Block>dkfsdkjfhskjdh</Block> */}
        {/* <Table /> */}
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
          newConversation={newConversation}
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          c={props.c}
        />
        <MobileNav />
        <div className='flex flex-col h-full w-full lg:ml-[225px]'>
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
          />
          {modalOpen && (
            <Modal
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              children={<></>}
            />
          )}
          <main className='container mx-auto flex-1 mt-0'>
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
                c={props.c}
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
            {path == '/account' ? (
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
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
