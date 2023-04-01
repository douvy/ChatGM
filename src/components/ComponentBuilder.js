import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { xonokai } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "@uiw/react-textarea-code-editor/dist.css";
import AutoExpandTextarea from './AutoExpandTextarea';

const CodeEditor = dynamic(
    () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
    { ssr: false }
);

function ComponentBuilder() {
    const [codeRequestMessage, setCodeRequestMessage] = useState('');
    const [code, setCode] = useState('');

    const handleCodeChange = (event) => {
        setCode(event.target.textContent);
    };

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
                console.log(data);
                setCode(data.result.response);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        setCodeRequestMessage('');
    };

    return (
        <>
            <div class="flex w-full h-screen">
                <div class="relative w-1/2">
                    <CodeEditor
                        value={code}
                        language="html"
                        placeholder="Please enter HTML code."
                        onChange={(evn) => setCode(evn.target.value)}
                        padding={15}
                        style={{
                            fontSize: 12,
                            backgroundColor: "#f5f5f5",
                            fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace"
                        }}
                        className="w-full h-1/2"
                    />
                    <form className="absolute bottom-0 flex items-end w-full p-4 md:p-4">
                        <AutoExpandTextarea
                            value={codeRequestMessage}
                            onChange={updateCodeRequestMessage}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a code prompt"
                            className="w-full p-2 mr-2 bg-white border border-gray-400 rounded"
                        />
                        <span className="button-container">
                            <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                        </span>
                    </form>
                </div>
                <div class="w-1/2">
                    <div dangerouslySetInnerHTML={{ __html: code }} />
                </div>
            </div>


        </>
    );
}

export default ComponentBuilder;
