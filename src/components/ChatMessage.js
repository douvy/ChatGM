import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function ChatMessage({ message, avatarSource, sender, ref }) {
    return (
        <div className="w-full box">
            <div className="message p-4 pt-2 relative">
                <img src={avatarSource} alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-2" />
                <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">{sender}</span>
                    <p className="text-xs inline-block absolute top-3 right-4 timestamp">
                        <span className="message-direction">Sent <i className="fa-regular fa-arrow-up-right fa-lg ml-1 mr-3 mt-5"></i></span> 3:42 PM
                    </p>
                    <p>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            children={message}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatMessage;