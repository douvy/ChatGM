import { useState, useRef } from 'react';
import ChatMessage from './ChatMessage';

function SavedMessages({
  starredMessages,
  setStarredMessages,
  role,
  setReferencedMessage,
  setConversationId,
  userInfo,
}) {
  const scrollContainer = useRef(null);
  const messagesToShow = starredMessages.filter((message) => {
    // console.log(message);
    return message.role == role;
  });

  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      {visible && (
        <div className="pl-7 pr-7 pt-5 pb-5 w-full flash flex justify-between zzz">
          <div aria-atomic="true" role="alert">
            Your details have been saved.
          </div>
          <button
            autoFocus
            className="focus:outline-none"
            type="button"
            aria-label="Dismiss this message"
            onClick={handleClose}
          >
            <i className="fa-solid fa-xmark text-blue"></i>
          </button>
        </div>
      )}
      <div className="container mx-auto max-w-[760px] mt-3 md:mt-5" id="saved">
        <h1 className="hidden text-title font-medium uppercase mb-5 text-white tracking-wide md:block">
          Saved
        </h1>
        {messagesToShow.length > 0 && (
          <div className="overflow-y-auto" id="messages-box" ref={scrollContainer}>
            {messagesToShow.map((message, index) => {
              return (
                <ChatMessage
                  onClick={() => {
                    setReferencedMessage(message);
                    setConversationId(message.conversationId);
                  }}
                  key={message.id}
                  index={index}
                  message={message}
                  avatarSource={message.role == 'user' ? message.avatarSource : 'avatar-chat.png'}
                  sender={message.role == 'user' ? message.sender : 'ChatGPT-3.5'}
                  received={true}
                  updateState={(index, updatedMessage) => {
                    setStarredMessages(
                      starredMessages.filter((t) => t.id !== updatedMessage.id)
                    );
                  }}
                  userInfo={userInfo}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedMessages;
