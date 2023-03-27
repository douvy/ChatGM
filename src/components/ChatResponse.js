import React from 'react';

function ChatResponse({ response }) {
    return (
        <div className="w-full box">
            <div className="message p-4 pt-4 relative">
                <img src="avatar-chat.png" alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-3" />
                <div className="pl-16 pt-0">
                    <span className="text-sm mb-1 inline-block name">GPT-3.5</span>
                    <p className="text-xs inline-block absolute top-1 right-4 timestamp">
                        <span className="message-direction">Received <i className="fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-5"></i></span> 3:42 PM
                    </p>
                    <p>{response}</p>
                </div>
            </div>
        </div>
    );
}

export default ChatResponse;