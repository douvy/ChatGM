import Head from 'next/head'
import { Inter } from 'next/font/google'
import React, { useState, useEffect, useRef, SetStateAction } from 'react';
import ConversationLinkList from '../components/ConversationLinkList';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SavedMessages from '../components/SavedMessages';
import FeaturesView from '../components/FeaturesView';
import TasksView from '../components/TasksView';
import ConversationsView from '../components/ConversationsView';
import ComponentBuilder from '../components/ComponentBuilder';
import { addInfiniteScroll } from '../utils/infiniteScroll';
import { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { User } from "@prisma/client";
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';


interface Message {
  role: string,
  content: string;
  avatarSource: string,
  sender: String,
}

interface Conversation {
  name?: string,
  messages: Message[],
  id?: number,
  isActive?: boolean,
}

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
  session: any;
  conversations: Conversation[],
  starredMessages: Message[],
  features: Feature[],
  tasks: any[]
}

const Home: NextPage<PageProps> = (props) => {
  const router = useRouter();
  const { route } = router;

  const { data: session, status } = useSession()
  if (status === "authenticated") {

  }

  const [currentRoute, setCurrentRoute] = useState('/');

  const [messages, setMessages] = useState<Message[]>([]);

  const [starredMessages, setStarredMessages] = useState<Message[]>(trpc.messages.query.useQuery(

  ).data || []);

  const [conversation, setConversation] = useState<Conversation>({
    name: "",
    messages: messages,
    isActive: false,
  });

  const [conversationId, setConversationId] = useState<number | undefined>();

  trpc.conversations.get.useQuery({ id: conversationId }, {
    enabled: Boolean(conversationId),
    onSuccess(data) {
      setConversation(data as Conversation);
    }
  });

  // const { isSuccess } = trpc.conversations.create.useQuery((conversation), {
  //   enabled: (!conversation.id && conversation.messages.length == 1),
  //   onSuccess(data: React.SetStateAction<Conversation>) {
  //     setConversation(data);
  //     console.log(data);
  //   }
  // });


  // const { isFetching } = trpc.openai.query.useQuery((conversation), {
  //   enabled: (!!conversation.id && conversation.messages.length == 1),
  //   onSuccess(data: React.SetStateAction<Conversation>) {
  //     setConversation(data);
  //     console.log(data);
  //   }
  // });

  // trpc.openai.generateName.useQuery((conversation), {
  //   enabled: (!!conversation.id && conversation.messages.length == 1),
  //   onSuccess(data: any) {
  //     setConversation(data);
  //     setConversations([...conversations, data]);
  //     console.log("Named conversation", data);
  //   }
  // });

  const [messageContent, setMessageContent] = useState('');

  const user = session?.user as User;
  const [newMessage, setMessage] = useState<Message>({
    role: "user",
    content: messageContent,
    avatarSource: "avatar.png",
    sender: session?.user?.username || "anonymous"
  });

  const updateMessageValue = (event: any) => {
    console.log(event.target.value);
    setMessageContent(event.target.value);
    setMessage({ ...newMessage, content: event.target.value });
    // setActiveComponent(<ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} />
  }

  const getMessageContent = () => {
    return newMessage.content;
  }

  const [newResponse, setResponse] = useState({
    response: "",
  })

  const [conversations, setConversations] = useState<Conversation[]>(props.conversations);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')
    ws.onopen = function () {
      console.log('WebSocket connection established')
      ws.send('Hello, server!')
    }
    ws.onmessage = function (event) {
      console.log(`Received message from server: ${event.data}`)
      const updatedConversations = JSON.parse(event.data);
      setConversations(updatedConversations);
      const updatedConversation = updatedConversations.find((_: Conversation) => {
        return _.id == conversation.id;
      });
      if (updatedConversation) {
        setConversation(updatedConversation);
      } else {
        setMessages([]);
        setConversation({
          messages: messages,
          isActive: false,
        });
      }
    }
    ws.onclose = function () {
      console.log('WebSocket connection closed')
    }
    return () => {
      ws.close()
    }
  }, [conversation, messages])

  useEffect(() => {
    setCurrentRoute('/');
  }, [conversation]);

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

  // const setActiveConversation = async (conversation: Conversation) => {
  //   // conversation.isActive = true;

  //   setConversationId(conversation.id);
  //   const response = await fetch(`api/conversations/${conversation.id}`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //   const fullConversation = await response.json();
  //   setConversation(fullConversation);
  //   // setConversation(conversation);
  //   // setActiveComponent(<ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} messageContent={messageContent} setMessageContent={setMessageContent} />)
  // }

  const newConversation = (e: Event) => {
    e.preventDefault();
    setConversation({
      messages: [],
      isActive: true,
    })
    setCurrentRoute('/');
  }

  const appendMessage = (message: Message) => {
    conversation.messages.push(message);
    // setConversation((conversation) => ({
    //   ...conversation,
    // }));
  }

  const sendMessage = async () => {
    appendMessage(newMessage);
    setMessage({
      role: "user",
      content: "",
      avatarSource: "avatar.png",
      sender: user.username || "anonymous",
    })
    var updatedConversation = conversation;
    if (!conversation.id) {
      updatedConversation = await client.conversations.create.query(conversation) as Conversation;
      console.log(updatedConversation);
      setConversation(updatedConversation);
      updatedConversation = await client.openai.generateName.query((updatedConversation)) as Conversation;
      setConversation(updatedConversation);
    } else {
      updatedConversation = await client.messages.create.query(({
        ...newMessage,
        conversationId: conversation.id,
      })) as Conversation;
    }

    updatedConversation = await client.openai.query.query((updatedConversation)) as Conversation;
    setConversation(updatedConversation);
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
    // <ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} messageContent={messageContent} setMessageContent={setMessageContent} updateConversations={updateConversations} />
  );

  return (
    <>
      <Head>
        <title>ChatGM</title>
        <meta name="description" content="a clean, visually appealing interface for ChatGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex" id="main-container">
        <nav className="fixed h-full w-[225px] text-white shadow-md hidden lg:block">
          <ConversationLinkList conversations={conversations} activeConversation={conversation} selectConversation={setConversationId} session={props.session} newConversation={newConversation}></ConversationLinkList>
          <hr className="my-4 border-t" />
          <Sidebar setConversations={setConversations} setConversation={setConversation} setActiveComponent={setActiveComponent} features={props.features} setCurrentRoute={setCurrentRoute} session={props.session} />
        </nav>
        <div className="fixed top-0 left-0 z-50 flex items-center justify-end w-full p-2 pr-3 lg:hidden">
          <button className="text-red-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col h-full w-full lg:ml-[225px]">
          <main className="container mx-auto p-4 flex-1 mt-6 md:mt-2">
            {currentRoute == '/' ? <ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} starredMessages={starredMessages} setStarredMessages={setStarredMessages} /> : null}
            {currentRoute == '/features' ? <FeaturesView passedFeatures={props.features}></FeaturesView> : null}
            {currentRoute == '/tasks' ? <TasksView passedTasks={props.tasks}></TasksView> : null}
            {currentRoute == '/conversations' ? <ConversationsView conversations={conversations} setConversations={setConversations}></ConversationsView> : null}
            {currentRoute == '/builder' ? <ComponentBuilder></ComponentBuilder> : null}
            {currentRoute == '/savedPrompts' ? <SavedMessages starredMessages={starredMessages} setStarredMessages={setStarredMessages} role='user'></SavedMessages> : null}
            {currentRoute == '/savedResponses' ? <SavedMessages starredMessages={starredMessages} setStarredMessages={setStarredMessages} role='assistant'></SavedMessages> : null}
          </main>
        </div>

      </div>
    </>
  )
}

export const loadConversations: GetServerSideProps<InitialProps> = async (context) => {
  const res = await fetch("/api/sendMessage");
  const conversations = await res.json();

  return {
    props: { conversations },
  };
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
  console.log(session);
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  const response = await fetch(`http://${baseUrl}/api/initialPageData`);
  console.log("response:", response);
  const { conversations, starredMessages, features, tasks } = await response.json();

  return {
    props: {
      session,
      conversations,
      starredMessages,
      features,
      tasks,
    },
  };
};

//export default withLocalStorage(Home);
export default Home;
