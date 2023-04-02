import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect, useRef, SetStateAction } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatResponse from '../components/ChatResponse';
import ConversationLinkListItem from '../components/ConversationLinkListItem';
import ConversationLinkList from '../components/ConversationLinkList';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SavedMessages from '../components/SavedMessages';
import FeaturesView from '../components/FeaturesView';
import TasksView from '../components/TasksView';
import ConversationsView from '../components/ConversationsView';
import ComponentBuilder from '../components/ComponentBuilder';
import { addInfiniteScroll } from '../utils/infiniteScroll';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ObjectId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import AutoExpandTextarea from '../components/AutoExpandTextarea';
import Router from 'next/router';
import { getSession, signOut } from 'next-auth/react';
// import { Route, Routes } from 'react-router-dom';
import { useRouter } from 'next/router';
import { parse } from 'cookie';
import { verify } from 'jsonwebtoken';
import { useSession } from 'next-auth/react';

interface User {
  username: string,
}

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

interface WithSession {
  session: {} | null;
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

function withLocalStorage<T extends WithSession>(WrappedComponent: React.ComponentType<T>) {
  const sessionStr = localStorage.getItem('session');
  const session = JSON.parse(sessionStr || "{}");

  return function WithLocalStorage(props: T) {
    return <WrappedComponent {...props} session={session} />;
  };
}

const Home: NextPage<PageProps> = (props) => {
  const router = useRouter();
  const { route } = router;

  const { data: session, status } = useSession()
  if (status === "authenticated") {

  }

  console.log("props", props);

  // const [session, setSession] = useState<Session | null>({
  //   user: {
  //     username: "anonymous",
  //   }
  // });

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     var sessionStr = localStorage.getItem('session');

  //     if (sessionStr !== null) {
  //       var session = JSON.parse(sessionStr);
  //       setSession(session);
  //       console.log(session);
  //     } else {
  //       setSession({
  //         user: {
  //           username: "anonymous",
  //         }
  //       })
  //       // Router.push('/signin');
  //     }
  //   }
  // }, []);

  function handleLogout(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    signOut({
      callbackUrl: '/auth/signin',
    });
    // localStorage.removeItem('session');
    // Router.push('/signin');
  }

  const [currentRoute, setCurrentRoute] = useState('/');

  const [messages, setMessages] = useState<Message[]>([]);

  const [starredMessages, setStarredMessages] = useState<Message[]>(props.starredMessages);

  const [conversation, setConversation] = useState<Conversation>({
    messages: messages,
    isActive: false,
  });

  const [messageContent, setMessageContent] = useState('');

  const user = session?.user as User;
  const [newMessage, setMessage] = useState<Message>({
    role: "user",
    content: messageContent,
    avatarSource: "avatar.png",
    sender: user.username || "anonymous"
  });
  console.log("SESSION:", session);

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
    response: "Nothing yet",
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

  const setActiveConversation = (conversation: Conversation) => {
    setConversation(conversation);
    // setActiveComponent(<ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} messageContent={messageContent} setMessageContent={setMessageContent} />)
  }

  const appendMessage = (message: Message) => {
    conversation.messages.push(message);
    setConversation((conversation) => (conversation));
  }

  const sendMessage = async () => {
    appendMessage(newMessage);
    setMessage({
      role: "user",
      content: "",
      avatarSource: "avatar.png",
      sender: user.username || "anonymous",
    })
    fetch("/api/sendMessage", {
      method: "POST",
      body: JSON.stringify({ prompt: newMessage.content, conversation: conversation }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
      .then(data => {
        setResponseValue(data.result.response);
        if (conversation.id != data.result.conversation.id) {
          setConversations((conversations) => [...conversations, data.result.conversation]);

          fetch('/api/assignName', {
            method: "POST",
            body: JSON.stringify({ conversation: data.result.conversation }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(response => response.json())
            .then(data => {
              // const updatedConversations = conversations.map(_conversation => {
              //   if (_conversation._id === conversation._id) {
              //     return data.conversation;
              //   } else {
              //     return _conversation;
              //   }
              // });
              setConversations([...conversations, data.conversation]);
              setConversation(data.conversation);
            })
            .catch(error => console.error(error));
        }

        setConversation((conversation) => (data.result.conversation));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const setMessageValue = (e: { target: { value: any; }; }) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      content: e.target.value,
    }));
  };

  const setResponseValue = (response: string) => {
    setResponse({
      response: response,
    });
  };

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      // handle "Enter" key press without the Shift key
      event.preventDefault();
      sendMessage();
    }
  }

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
          <ConversationLinkList conversations={conversations} activeConversation={conversation} selectConversation={setActiveConversation} session={props.session} setCurrentRoute={setCurrentRoute}></ConversationLinkList>
          <hr className="my-4 border-t" />
          <Sidebar setConversations={setConversations} setConversation={setConversation} handleLogout={handleLogout} setActiveComponent={setActiveComponent} features={props.features} setCurrentRoute={setCurrentRoute} session={props.session} />
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
            {currentRoute == '/' ? <ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} updateMessageValue={updateMessageValue} messageContent={messageContent} setMessageContent={setMessageContent} updateConversations={updateConversations} starredMessages={starredMessages} setStarredMessages={setStarredMessages} /> : null}
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
  const { req } = context;
  const cookies = context.req.headers.cookie;

  // Default user is null
  let user = null;

  if (cookies) {
    console.log("cookies:", cookies);
    try {
      // Parse cookies and get the token
      const parsedCookies = parse(cookies);
      const token = parsedCookies['authtoken'];

      // Verify the token and extract the user payload
      // const decoded = verify(token, process.env.JWT_SECRET);
      // var sessionId = decoded.id;
      // console.log(sessionId);
    } catch (error) {
      console.error('Error while decoding the token:', error);
    }
  }
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

  const response = await fetch(`http://${baseUrl}/api/initialPageData`);
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
