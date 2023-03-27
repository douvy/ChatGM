import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect, useRef } from 'react';
import ChatMessage from '../Components/ChatMessage';
import ChatResponse from '../Components/ChatResponse';
import { addInfiniteScroll } from '../utils/infiniteScroll';

interface Message {
  role: string,
  content: string;
  avatarSource: string,
  sender: string,
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setMessage] = useState<Message>({
    role: "user",
    content: "",
    avatarSource: "avatar.jpg",
    sender: "douvy",
  });

  const [newResponse, setResponse] = useState({
    response: "Nothing yet",
  })

  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollContainer.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = useRef<HTMLDivElement>(null);


  const appendMessage = (message: Message) => {
    setMessages((messages) => ([
      ...messages,
      message
    ]));
  }

  const sendMessage = async () => {
    appendMessage(newMessage);
    setMessage({
      role: "user",
      content: "nothing",
      avatarSource: "avatar.jpg",
      sender: "douvy",
    })
    fetch("/api/sendMessage", {
      method: "POST",
      body: JSON.stringify({ prompt: newMessage.content, previousMessages: messages }),
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
        setResponseValue(data.result);
        appendMessage({
          role: "assistant",
          content: data.result,
          avatarSource: "avatar-chat.png",
          sender: "ChatGPT-3.5",
        })
        setMessage({
          role: "user",
          content: "",
          avatarSource: "avatar.jpg",
          sender: "douvy",
        })
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

  function handleKeyDown(event: { preventDefault: () => void; keyCode: number; }) {
    if (event.keyCode === 13) {
      // handle "Enter" key press
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex">
        <nav className="fixed h-full w-[225px] text-white shadow-md hidden lg:block">
          <ul className="pl-3">
            <a href="#" id="new-chat"><li className="p-2 mt-2 pl-4"><i className="far fa-arrow-up-right fa-lg"></i> New Chat</li></a>
            <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="/avatar.jpg" className="w-7 h-7 rounded-full" /><span className="ml-3">douvy</span></li></a>
            <a href="#" className="active"><li className="p-2 pl-4"><i className="far fa-message-middle fa-xl mr-4"></i>AI Food App Ideas</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-message-middle fa-xl mr-4"></i> Cryptography</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-message-middle fa-xl mr-4"></i> Blockchain Explorer</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-message-middle fa-xl mr-4"></i> New Chat UI</li></a>
          </ul>
          <hr className="my-4 border-t border-red" />
          <ul className="pl-3 z">
            <a href="#"><li className="p-2 pl-4"><i className="far fa-trash-can-xmark fa-lg mr-4"></i> Clear Conversations</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-brightness fa-lg mr-4"></i> Light Mode</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-user-hair-mullet fa-lg mr-4"></i> My Account</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-arrow-right-from-bracket fa-lg mr-4"></i> Log Out</li></a>
            <a href="#"><li className="p-2 pl-4"><i className="far fa-coin fa-lg mr-4"></i> Crypto</li></a>
          </ul>
        </nav>
        <div className="fixed top-0 left-0 z-50 flex items-center justify-end w-full p-4 lg:hidden">
          <button className="text-red-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col h-full w-full lg:ml-[225px]">
          <main className="container mx-auto max-w-[770px] flex-1 p-4">
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>

              {messages.map((message, index) => (
                <ChatMessage key={index} message={message.content} avatarSource={message.avatarSource} sender={message.sender} ref={index === messages.length - 1 ? lastMessage : null} />
              ))}

            </div>

            <form className="flex items-center max-w-[770px] p-4">
              <textarea className="w-full p-2 mr-2" placeholder="Type your message..." onKeyDown={handleKeyDown} onChange={setMessageValue} value={newMessage.content} />
              <span className="button-container">
                <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
              </span>
            </form>
          </main>
        </div>

      </div>
    </>
  )
}