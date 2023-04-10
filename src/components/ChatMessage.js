import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { trpc } from '../utils/trpc';
import copy from 'clipboard-copy';
import { format, utcToZonedTime } from 'date-fns-tz';
import botPusher from '../lib/botPusher';

function ChatMessage({ index, message, avatarSource, sender, updateState, setConversation, referencedMessage, onClick, userInfo }) {
  const [localMessage, setLocalMessage] = useState(message);
  const [copied, setCopied] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const cursorPositionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalMessage(message);
  }, [message]);

  useEffect(() => {
    if (!editingMessage) {
      return;
    }
    // Set the focus on the textarea element
    // textareaRef?.current?.focus();

    // Set the cursor position to the end of the input value
    const textarea = textareaRef.current;
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
  }, [editingMessage]);

  const updateMessageMutation = trpc.messages.update.useMutation();
  const addStarredMessageMutation = trpc.users.addStarredMessage.useMutation();

  function formatTimestamp(timestamp) {
    const date = timestamp ? new Date(timestamp) : new Date();
    const zonedDate = utcToZonedTime(date, 'America/New_York');
    const formattedDate = format(zonedDate, 'h:mm a');
    return formattedDate;
  }

  const currentTimestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const setMessageContent = (e) => {
  }

  const customRenderer = {
    p: ({ children }) => (
      <>
        {children.map((child) => {
          if (typeof child === 'string') {
            const parts = child.split('\n');
            return parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {part}
              </React.Fragment>
            ));
          }
          return child;
        })}
      </>
    ),
  };

  const starMessage = async () => {
    const updatedMessage = {
      ...localMessage,
      starred: !localMessage.starred,
    };
    updateMessageMutation.mutate(updatedMessage);
    addStarredMessageMutation.mutate({ messageId: updatedMessage.id });
    setLocalMessage(updatedMessage);
    updateState(index, updatedMessage);
  };

  function copyToClipboard(text) {
    copy(text)
      .then(() => {
        console.log('Copied to clipboard:', text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Revert back to copy icon after 2 seconds
      })
      .catch((err) => console.error('Failed to copy:', err));
  }

  const handleContentInput = (event) => {
    cursorPositionRef.current = window.getSelection().getRangeAt(0).startOffset;
  };

  const sentFrom = sender.username ? sender.username : sender.role;

  return (
    <div className="w-full box cursor-pointer"
      onMouseEnter={() => setShowEditIcon(message.role == 'user' && true)}
      onMouseLeave={() => setShowEditIcon(message.role == 'user' && false)}
      onClick={onClick}
    >
      <div className={`message p-4 pt-4 relative ${message.id == referencedMessage?.id ? 'active' : ''}`}>
        <img src={sender.avatarSource || 'avatar-chat.png'} alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-2" />
        <div className="pl-16 pt-0">
          <span className="text-sm mb-1 inline-block name">{sentFrom}</span> <br />
          <p className="text-xs inline-block absolute top-3 right-4 timestamp">
            <span className="message-direction">
              {sender == 'ChatGPT-3.5' ? 'Received' : (message.inProgress ? 'Typing...' : 'Sent')}
              <i
                className={`fa-regular ${sender == 'ChatGPT-3.5' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'
                  } fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {formatTimestamp(message.createdAt)}
            <i className={`fa-stars ${localMessage.starred ? 'fa-solid' : 'fa-regular'} ml-2 cursor-pointer`} onClick={starMessage}></i>
            {copied ? (
              <i className="fa-solid fa-check text-green w-5 h-5 ml-3"></i>
            ) : (
              <i
                className={`fa-light fa-copy w-5 h-5 ml-3 cursor-pointer`}
                onClick={() => {
                  copyToClipboard(localMessage.content);
                }}
              ></i>
            )}
            {userInfo.enableChatGMBot && userInfo.telegramUserId && <i className="fa fa-telegram text-blue-500 w-5 h-5 ml-3"
              onClick={((e) => {
                e.preventDefault();
                botPusher.channel?.trigger('client-message', {
                  message: localMessage.content,
                  userId: userInfo.telegramUserId,
                })
              })}></i>}
            {showEditIcon && (
              <i
                className="fa-sharp fa-regular fa-pen-to-square w-5 h-5 ml-3 cursor-pointer"
                onClick={() => {
                  setEditingMessage(true);
                }}
              ></i>
            )}
          </p>
          {!editingMessage ? <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={message.content}
            components={customRenderer}
          /> :
            <form>
              {/* <div className="focus:outline-none focus:border-none" contentEditable onInput={(e) => {
                // if (cursorPositionRef.current !== null) {
                //   const range = document.createRange();
                //   const selection = window.getSelection();
                //   range.setStart(event.target.childNodes[0], cursorPositionRef.current);
                //   range.collapse(true);
                //   selection.removeAllRanges();
                //   selection.addRange(range);
                // }

                setLocalMessage({
                  ...localMessage,
                  content: e.target.textContent,
                })
              }} onBlur={handleContentInput}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  children={localMessage.content}
                  components={customRenderer}
                />
              </div> */}
              <textarea value={localMessage.content} ref={textareaRef} className="p-0 m-0 h-auto w-full border-none focus:outline-none" rows="1" autoFocus={true} spellCheck="false" onInput={(e) => {
                setLocalMessage({
                  ...localMessage,
                  content: e.target.value,
                })
              }} onBlur={handleContentInput}>
              </textarea>
              <div className="py-5 flex justify-center">
                <div className="flex items-center">
                  <span className=" p-0 !important">
                    <button type="button" onClick={() => {
                      console.log("localMessage", localMessage)
                      updateMessageMutation.mutate(localMessage);
                      setEditingMessage(false);
                      updateState(index, localMessage, true);
                    }} className="editing-message-save px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border rounded border-transparent text-white btn-gray bg-transparent">
                      Save & Submit
                    </button>
                  </span>
                  <div className="h-4 w-px mx-3"></div>
                  <span className="button-container ml-auto">
                    <button type="button" onClick={() => {
                      setEditingMessage(false);
                      setLocalMessage({
                        ...localMessage,
                        content: message.content,
                      })
                    }} className="font-semibold text-xs uppercase p-1 editing-message-cancel bg-transparent">
                      Cancel
                    </button>
                  </span>
                </div>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;