import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import ChatMessage from '../../../components/ChatMessage';

function ConversationView({ conversation }) {
  const router = useRouter();
  const { id } = router.query;
  console.log('CONVERSATION:', conversation);

  if (!conversation) {
    return <></>;
  }

  return (
    <div className='mx-auto max-w-[760px]'>
      <div className='p-4 overflow-y-auto' id='messages-box'>
        {conversation.messages.map((message, index) => {
          return (
            <ChatMessage
              key={conversation.id + index}
              index={index}
              message={message}
              avatarSource={'/' + message.avatarSource}
              sender={message.role == 'user' ? message.sender : 'ChatGPT-3.5'}
              received={true}
              updateState={undefined}
              setConversation={undefined}
              referencedMessage={undefined}
              onClick={() => {}}
              userInfo={{}}
            />
          );
        })}
      </div>
    </div>
  );
}

// export const getServerSideProps = async ({ req, params }) => {
//   const { id } = params;

//   const baseUrl = req ? `${req.headers.host}` : '';

//   const response = await fetch(`http://${baseUrl}/api/conversations/${id}`);
//   const conversation = await response.json();
//   console.log(conversation);

//   if (!conversation) {
//     return {
//       redirect: {
//         destination: '/notfound',
//         permanent: false
//       }
//     };
//   }

//   return {
//     props: {
//       conversation
//     }
//   };
// };

export default ConversationView;
