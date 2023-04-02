import { useState, useRef } from 'react';
import { useRouter } from 'next/router'
import { GetServerSideProps, NextPage } from 'next';
import ChatMessage from '../../components/ChatMessage';

function ConversationView({ conversation }) {
  const router = useRouter()
  const { id } = router.query

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="p-4 overflow-y-auto" id="messages-box">
        {conversation.messages.map((message, index) => {
          return (
            <ChatMessage
              key={message.id}
              index={index}
              message={message}
              avatarSource={message.role == "user" ? `../${message.avatarSource}` : "../avatar-chat.png"}
              sender={message.role == "user" ? message.sender : "ChatGPT-3.5"}
              received={true}
              updateState={() => { }}
            />
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps = async ({ req, params }) => {
  const { id } = params;
  console.log(id);

  // const router = useRouter()
  // const { id } = router.query;

  const baseUrl = req ? `${req.headers.host}` : '';

  const response = await fetch(`http://${baseUrl}/api/conversations/${id}`);
  const conversation = await response.json();

  if (!conversation) {
    return {
      redirect: {
        destination: '/notfound',
        permanent: false,
      },
    }
  }

  return {
    props: {
      conversation
    },
  };
};

export default ConversationView;
