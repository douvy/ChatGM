import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import "@uiw/react-textarea-code-editor/dist.css";
import AutoExpandTextarea from './AutoExpandTextarea';

const CodeEditor = dynamic(
    () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
    { ssr: false }
);

function ComponentBuilder() {
    const [codeRequestMessage, setCodeRequestMessage] = useState('');
    const [code, setCode] = useState('');

    const updateCodeRequestMessage = (event) => {
        setCodeRequestMessage(event.target.value);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    const sendMessage = async () => {
        fetch("/api/sendCodeRequestMessage", {
            method: "POST",
            body: JSON.stringify({ prompt: codeRequestMessage }),
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
                setCode(data.result.response);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        setCodeRequestMessage('');
    };

    return (
        <>
            <div className="flex flex-wrap w-full h-screen p-5">
                <div className="relative w-full lg:w-1/2 h-[570px] pr-2" id="code-editor-wrapper">
                    <CodeEditor
                        value={code}
                        language="html"
                        placeholder="Please enter HTML code."
                        onChange={(evn) => setCode(evn.target.value)}
                        padding={15}
                        style={{
                            fontSize: 12,
                            backgroundColor: "#222427",
                            height: "100%",
                            minHeight: "400px",
                            overflowY: "auto",
                        }}
                        className="w-full h-full"
                        id="code-editor"
                    />
                </div>
                <div className="w-full lg:w-1/2 h-[570px] pl-2">
                    <div className="h-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: code }} />
                </div>
            </div>

            <div className="flex w-full justify-center" id="component-form">
                <form className="absolute bottom-0 flex items-end w-[730px] p-4 md:p-4">
                    <AutoExpandTextarea
                        value={codeRequestMessage}
                        onChange={updateCodeRequestMessage}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a code prompt"
                        className="w-full p-2 mr-2 text-black bg-white border border-gray-400 rounded"
                    />
                    <span className="button-container">
                        <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                    </span>
                </form>
            </div>
        </>
    );
}

export default ComponentBuilder;
