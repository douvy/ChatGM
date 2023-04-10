import Head from 'next/head'
import { Inter } from 'next/font/google'
import React, { useState, useEffect, useRef, SetStateAction } from 'react';
import ConversationLinkList from '../components/ConversationLinkList';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SavedMessages from '../components/SavedMessages';
import FeaturesView from '../components/FeaturesView';
import Tasks from '../components/Tasks';
import ConversationsView from '../components/ConversationsView';
// import ComponentBuilder from '../components/ComponentBuilder';
import MyAccount from '../components/MyAccount';
import ConversationMembers from '../components/ConversationMembers';
import ActiveTask from '../components/ActiveTask';
import { addInfiniteScroll } from '../utils/infiniteScroll';
import { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { User, Conversation as PrismaConversation } from "@prisma/client";
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import { Conversation, Message } from '../interfaces';
import { TodoistApi } from '@doist/todoist-api-typescript';


interface InitialProps {
  conversations: Conversation[]
}

interface Session {
  user: {
    username: String,
    _id?: String,
  }
  _id?: String
}

interface Feature {
  name: string,
  description: string
}

interface PageProps {
  session: any,
  conversations: Conversation[],
  starredMessages: Message[],
  features?: Feature[],
  tasks?: any[],
  userInfo: any,
  activeTask: any,
}

interface ChannelData {
  name: string;
  message: string;
  timestamp: string;
}

const Home: NextPage<PageProps> = (props) => {
  const router = useRouter();
  const { route } = router;
  const { slug } = router.query;
  const trpcCtx = trpc.useContext();

  const { data: session, status } = useSession()
  if (status === "authenticated") {

  }

  const [currentRoute, setCurrentRoute] = useState('/');

  const [messages, setMessages] = useState<Message[]>([]);

  const [starredMessages, setStarredMessages] = useState<Message[]>(props.starredMessages || []);

  const [conversationId, setConversationId] = useState<number | undefined>();

  const [messageContent, setMessageContent] = useState('');

  const user = session?.user as User;
  const [newMessage, setMessage] = useState<Message>({
    role: "user",
    content: messageContent,
    avatarSource: "avatar.png",
    senderId: session?.user?.id || 0,
  });

  const [referencedMessage, setReferencedMessage] = useState<Message | undefined>(undefined);

  const updateMessageValue = (event: any) => {
    setMessageContent(event.target.value);
    setMessage({ ...newMessage, content: event.target.value });
  }

  const getMessageContent = () => {
    return newMessage.content;
  }

  const [newResponse, setResponse] = useState({
    response: "",
  })

  const [userInfo, setUserInfo] = useState<any>(props.userInfo || []);

  const [conversation, setConversation] = useState<Conversation>({
    name: "",
    messages: messages,
    isActive: false,
    ownerId: userInfo.id,
    creatorId: userInfo.id,
    isPublic: false,
  });
  // console.log("conversation:", conversation);

  const [conversations, setConversations] = useState<Conversation[]>(props.conversations || []);

  const selectConversation = (conversation: Conversation) => {
    setConversation(conversation);
    setConversationId(conversation.id);
  }

  const [activeTask, setActiveTask] = useState<any>(props.activeTask);

  useEffect(() => {
    if (userInfo.activeTaskId && userInfo.activeTaskId != activeTask.id) {
      const api = new TodoistApi(userInfo.todoistApiKey)
      api.getTask(userInfo.activeTaskId).then((task) => {
        setActiveTask(task);
      });
    }
  }, [userInfo]);

  useEffect(() => {
    if (currentRoute != '/') {
      setConversationId(undefined);
      // setConversation({});
    }
  }, [currentRoute])

  useEffect(() => {
    if (conversationId) {
      if (conversationId != conversation.id || !conversation.participants) {
        client.conversations.get.query({ id: conversationId }).then((data) => {
          setConversation(data as Conversation);
        })
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
  }, [conversation]);

  useEffect(() => {
    setMessage({
      ...newMessage,
      senderId: session?.user?.id || 0
    })
  }, [session])
  // useEffect(() => {
  //   if (conversation.messages.length == 1) {
  //     alert("one message");
  //   }
  //   alert(Boolean(!conversation.id && conversation.messages.length == 1));
  //   // alert(JSON.stringify(conversation));
  // }, [conversation]);

  // useEffect(() => {
  //   // Fetch the conversations data from an API
  //   fetch('/api/getConversations')
  //     .then(response => response.json())
  //     .then(data => setConversations(data))
  //     .catch(error => console.error(error));
  // }, []);

  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollContainer.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = useRef<HTMLDivElement>(null);

  const newConversation = (e: Event) => {
    e.preventDefault();
    setConversation({
      messages: [],
      isActive: true,
      ownerId: userInfo.id,
      creatorId: userInfo.id,
      isPublic: false,
    })
    setConversationId(undefined);
    setCurrentRoute('/');
  }

  const appendMessage = (message: Message) => {
    conversation.messages.push(message);
    setConversation((conversation) => ({
      ...conversation,
    }));
  }

  const sendMessage = async () => {
    if (newMessage.content.startsWith("@") && conversation.id) {
      console.log("@");
      const updatedConversation = await client.conversations.addParticipant.mutate(
        {
          conversationId: conversation.id,
          participantUsername: newMessage.content.split(" ")[0].substring(1),
        }
      )
      return updateConversations;
    }
    appendMessage(newMessage);
    setMessage({
      role: "user",
      content: "",
      avatarSource: "avatar.png",
      senderId: user.id || 0,
    })
    var updatedConversation = conversation as PrismaConversation;
    if (!conversation.id) {
      updatedConversation = await client.conversations.create.query(conversation);
      setConversations([updatedConversation as Conversation, ...conversations]);
      updatedConversation = await client.openai.generateName.query((updatedConversation)) || updatedConversation;
      setConversations([updatedConversation as Conversation, ...conversations]);
      setConversation({
        ...conversation,
        name: updatedConversation.name || conversation.name
      });
      setConversationId(updatedConversation.id);
    } else {
      updatedConversation = await client.messages.create.query(({
        ...newMessage,
        conversationId: conversation.id,
      })) as PrismaConversation;
    }

    // const placeholderResponse = {
    //   role: "assistant",
    //   content: ".",
    //   avatarSource: "avatar-chat.png",
    //   sender: "ChatGPT-3.5",
    // };
    // setConversation({
    //   ...updatedConversation,
    //   messages: [...updatedConversation.messages, placeholderResponse]
    // });
    // const interval = setInterval(() => {
    //   placeholderResponse.content += '.';
    //   setConversation({
    //     ...updatedConversation,
    //     messages: [...updatedConversation.messages, placeholderResponse]
    //   });
    // }, 100);

    updatedConversation = await client.openai.query.query((updatedConversation)) as PrismaConversation;
    console.log("updatedConversation:", updatedConversation);
    // clearInterval(interval);
    setConversation({
      ...updatedConversation as Conversation,
      messages: (updatedConversation as Conversation).messages,
    });
    setConversations(conversations.map((c) => c.id == updatedConversation.id ? updatedConversation as Conversation : c));
  };

  const updateConversations = (updatedConversation: Conversation, index: number) => {
    const updatedConversations = [...conversations];
    updatedConversations[index] = updatedConversation;
  }

  useEffect(() => {
    if (scrollContainer.current) {
      addInfiniteScroll(scrollContainer.current);
    }
  }, []);

  var chat = [];

  const [activeComponent, setActiveComponent] = useState<any>(
  );

  return (
    <>
      <Head>
        <title>ChatGM</title>
        <meta name="description" content="a clean, visually appealing interface for ChatGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="stylesheet" href="/fontawesome.min.css" /> */}
      </Head>
      <div className="flex" id="main-container">
        <nav className="fixed h-full w-[228px] shadow-md hidden lg:block">
          <ConversationLinkList conversations={conversations} setConversation={setConversation} activeConversation={conversation} activeConversationId={conversationId} selectConversation={selectConversation} userInfo={userInfo} newConversation={newConversation} setConversations={setConversations} currentRoute={currentRoute}></ConversationLinkList>
          <hr className="my-4 border-t" />
          <Sidebar setConversations={setConversations} setConversation={setConversation} setActiveComponent={setActiveComponent} features={props.features} currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} session={props.session} userInfo={userInfo} />
        </nav>
        <div className="fixed top-0 left-0 z-50 flex items-center justify-end w-full p-2 pr-3 lg:hidden">
          <button className="text-red-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col h-full w-full lg:ml-[225px]">
          {userInfo.activeTaskId && <ActiveTask activeTask={activeTask} userInfo={userInfo} />}

          {currentRoute == '/' && <ConversationMembers conversation={conversation} userInfo={userInfo} />}
          <main className="container mx-auto flex-1 mt-0">
            {currentRoute == '/' ? <ChatWindow conversationId={conversationId} conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} starredMessages={starredMessages} setStarredMessages={setStarredMessages} referencedMessage={referencedMessage} setReferencedMessage={setReferencedMessage} userInfo={userInfo} /> : null}
            {currentRoute == '/features' ? <FeaturesView passedFeatures={props.features}></FeaturesView> : null}
            {currentRoute == '/tasks' ? <Tasks userInfo={userInfo} setUserInfo={setUserInfo}></Tasks> : null}
            {currentRoute == '/features' ? <FeaturesView passedFeatures={props.features}></FeaturesView> : null}
            {currentRoute == '/myAccount' ? <MyAccount userInfo={userInfo} setUserInfo={setUserInfo}></MyAccount> : null}
            {currentRoute == '/conversations' ? <ConversationsView conversations={conversations} setConversations={setConversations}></ConversationsView> : null}
            {/* {currentRoute == '/builder' ? <ComponentBuilder></ComponentBuilder> : null} */}
            {currentRoute == '/savedPrompts' ? <SavedMessages starredMessages={starredMessages} setStarredMessages={setStarredMessages} setReferencedMessage={setReferencedMessage} setConversationId={setConversationId} userInfo={userInfo} role='user'></SavedMessages> : null}
            {currentRoute == '/savedResponses' ? <SavedMessages starredMessages={starredMessages} setStarredMessages={setStarredMessages} setReferencedMessage={setReferencedMessage} setConversationId={setConversationId} userInfo={userInfo} role='assistant'></SavedMessages> : null}
            <div className="mx-auto max-w-[760px] mt-3 md:mt-5 hidden">
              <textarea className="w-full text-black" rows={10} defaultValue={JSON.stringify(conversation, null, 2)}></textarea>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  console.log("getServerSideProps");
  // const convos = trpc.conversations.useQuery();
  // console.log("CONVOS:", convos);
  // console.log(convos.data);
  const { req } = context;

  // Default user is null
  let user = null;

  const baseUrl = req ? `${req.headers.host}` : '';

  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  // const response = await fetch(`http://${baseUrl}/api/initialPageData`);
  // const { conversations, starredMessages, features, tasks } = await response.json();

  const userInfo = (await client.users.get.query({ id: session.user.id }))
  const activeTask = userInfo?.activeTaskId && userInfo?.todoistApiKey ? await (async () => {
    if (userInfo.todoistApiKey == null) return;
    if (userInfo.activeTaskId == null) return;
    const api = new TodoistApi(userInfo.todoistApiKey)
    return await api.getTask(userInfo.activeTaskId);
  })() : {}
  console.log("activeTask:", activeTask);

  return {
    props: {
      session: {},
      conversations: (await client.conversations.withPartialMessages.query({
        where: {
          participants: {
            some: {
              id: session.user.id,
            },
          },
        },
        orderBy: { id: 'desc' },
      })),
      userInfo: userInfo,
      starredMessages: await client.messages.starred.query({
        userId: session.user.id,
      }) || [],
      activeTask: activeTask
    },
  };
};

//export default withLocalStorage(Home);
export default Home;
