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
import { addInfiniteScroll } from '../utils/infiniteScroll';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ObjectId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import AutoExpandTextarea from '../components/AutoExpandTextarea';
import Router from 'next/router';
import { getSession } from 'next-auth/react';

interface Message {
  role: string,
  content: string;
  avatarSource: string,
  sender: String,
}

interface Conversation {
  name?: string,
  messages: Message[],
  _id?: ObjectId,
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

interface PageProps {
  session: any;
}

function withLocalStorage<T extends WithSession>(WrappedComponent: React.ComponentType<T>) {
  const sessionStr = localStorage.getItem('session');
  const session = JSON.parse(sessionStr || "{}");

  return function WithLocalStorage(props: T) {
    return <WrappedComponent {...props} session={session} />;
  };
}

const Home: NextPage<PageProps> = (props) => {

  console.log("props", props);
  const session = {};

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
    localStorage.removeItem('session');
    Router.push('/signin');
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const [conversation, setConversation] = useState<Conversation>({
    messages: messages,
    isActive: false,
  });

  const [newMessage, setMessage] = useState<Message>({
    role: "user",
    content: "",
    avatarSource: "avatar.png",
    sender: session?.user?.username || "anonymous"
  });

  const [newResponse, setResponse] = useState({
    response: "Nothing yet",
  })

  const [conversations, setConversations] = useState<Conversation[]>([]);

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
        return _._id == conversation._id;
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
    // Fetch the conversations data from an API
    fetch('/api/getConversations')
      .then(response => response.json())
      .then(data => setConversations(data))
      .catch(error => console.error(error));
  }, []);

  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollContainer.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = useRef<HTMLDivElement>(null);

  const setActiveConversation = (conversation: Conversation) => {
    setConversation(conversation);
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
      sender: session?.user?.username || "anonymous",
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
        if (conversation._id != data.result.conversation._id) {
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

  useEffect(() => {
    if (scrollContainer.current) {
      addInfiniteScroll(scrollContainer.current);
    }
  }, []);

  var chat = [];
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
          <ConversationLinkList conversations={conversations} activeConversation={conversation} selectConversation={setActiveConversation}></ConversationLinkList>
          <hr className="my-4 border-t" />
          <Sidebar setConversations={setConversations} setConversation={setConversation} handleLogout={handleLogout} />
        </nav>
        <div className="fixed top-0 left-0 z-50 flex items-center justify-end w-full p-2 pr-3 lg:hidden">
          <button className="text-red-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col h-full w-full lg:ml-[225px]">
          <main className="container mx-auto max-w-[760px] flex-1 mt-6 md:mt-2">
            <ChatWindow conversation={conversation} setConversation={setConversation} sendMessage={sendMessage} newMessage={newMessage} setMessage={setMessage} />
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

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  console.log("where am i");
  const session = await getSession(context);
  console.log(session);

  return {
    props: {
      session,
    },
  };
};

//export default withLocalStorage(Home);
export default Home;
