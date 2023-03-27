import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState } from 'react';

export default function Home() {

  const [newMessage, setMessage] = useState({
    message: "",
  });

  const [newResponse, setResponse] = useState({
    response: "Nothing yet",
  })

  const sendMessage = async () => {
    fetch("/api/sendMessage", {
      method: "POST",
      body: JSON.stringify({ prompt: newMessage.message }),
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
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const setMessageValue = (e: { target: { value: any; }; }) => {
    setMessage({
      message: e.target.value,
    });
  };

  const setResponseValue = (response: string) => {
    setResponse({
      response: response,
    });
  };

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
            <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="assets/img/avatar.jpg" className="w-7 rounded-full" /><span className="ml-3">douvy</span></li></a>
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
            <div className="p-4 overflow-y-auto" id="messages-box">

              <div className="w-full box">
                <div className="message p-4 pt-4 relative">
                  <img src="assets/img/avatar.jpg" alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-3" />
                  <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">douvy</span>
                    <p className="text-xs inline-block absolute top-1 right-4 timestamp">
                      <span className="message-direction">Sent <i className="fa-regular fa-arrow-up-right fa-lg ml-1 mr-3 mt-5"></i></span> 3:42 PM
                    </p>
                    <p>
                      I like technology and cooking. What are 5 two-week web apps I could build using AI that is inexpensive and has the potential to generate revenue?
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full box">
                <div className="message p-4 pt-4 relative">
                  <img src="assets/img/favicon.png" alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-3" />
                  <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">GPT-3.5</span>
                    <p className="text-xs inline-block absolute top-1 right-4 timestamp">
                      <span className="message-direction">Received <i className="fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-5"></i></span> 3:42 PM
                    </p>
                    <ol className="list-decimal list-inside">
                      <li className="mb-3">AI Recipe Generator: Create a web app that uses AI to analyze a user's taste preferences and suggest personalized recipes based on their favorite ingredients and dietary restrictions.</li>
                      <li>Kitchen Inventory Manager: Build an app that tracks users' kitchen inventory and suggests recipes based on available ingredients, using AI for efficient organization and management.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="w-full box">
                <div className="message p-4 pt-4 relative">
                  <img src="assets/img/avatar.jpg" alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-3" />
                  <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">douvy</span>
                    <p className="text-xs inline-block absolute top-1 right-4 timestamp">
                      <span className="message-direction">
                        Sent <i className="fa-regular fa-arrow-up-right fa-lg ml-1 mr-3 mt-5" />
                      </span> 3:43 PM
                    </p>
                    <p>
                      thanks, let's go with the kitchen inventory manager and use next.js. what should I do after I create a spreadsheet
                      of all available ingredients?
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full box last">
                <div className="message p-4 pt-4 relative">
                  <img src="assets/img/favicon.png" alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-3" />
                  <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">GPT-3.5</span>
                    <p className="text-xs inline-block absolute top-1 right-4 timestamp">
                      <span className="message-direction">
                        Received <i className="fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-5" />
                      </span> 3:43 PM
                    </p>
                    <p>{newResponse.response}</p>
                  </div>
                </div>
              </div>

            </div>

            <form className="flex items-center max-w-[770px] p-4">
              <input type="text" className="w-full p-2 mr-2" placeholder="Type your message..." onChange={setMessageValue} value={newMessage.message} />
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