import React, { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import { marked } from 'marked';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false
});

export default function TextEditor({ content, setContent, userInfo, setUserInfo, setDebuggerObject }) {
    const [editorHtml, setEditorHtml] = useState(content);
    const [note, setNote] = useState({
        content: '',
    });
    const [queryString, setQueryString] = useState('');
    const [runningQuery, setRunningQuery] = useState(false);
    const [placeholderText, setPlaceholderText] = useState("Running query to GPT...");
    const timerRef = useRef(null);
    const updateNote = trpc.users.saveNote.useMutation();
    const spinnerIcon = "<span className='spinner'></span>"

    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef?.current) {
            editorRef.current?.focus && editorRef.current.focus();
        }
    }, []);

    if (!note.id) {
        client.users.getNote.query().then((note) => {
            note && setNote(note);
        })
    }

    const save = () => {
        updateNote.mutate(note);
        console.log("Saved note");
    }

    useEffect(() => {
        setEditorHtml(note.content);
    }, [note]);

    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(save, 1000);

        const saveInterval = setInterval(save, 10000);
        // Cleanup the interval on unmount
        return () => clearInterval(saveInterval);

    }, [note]);

    useEffect(() => {
        console.log(queryString, note.content);
        if (queryString.startsWith('{') &&
            queryString.endsWith('}') &&
            note.content.includes(queryString) &&
            !runningQuery) {
            const query = queryString.replace(/\{(.+?)\}/g, "$1");
            const updatedContent = note.content.replace(query, placeholderText);
            note.content = updatedContent;
            setNote({
                ...note,
                content: updatedContent
            })
            runQuery(query).then((response) => {
                const markedResponse = marked(response);
                const updatedContent = note.content.replace(`{${placeholderText}}`, markedResponse);
                setNote({
                    ...note,
                    content: updatedContent
                })
                setQueryString('');
                setRunningQuery(false);
            });
            // setInterval(() => {
            //     const updatedPlaceholderText = placeholderText + '.';
            //     setNote({
            //         ...note,
            //         content: note.content.replace(placeholderText, updatedPlaceholderText)
            //     });
            //     setPlaceholderText(updatedPlaceholderText);
            // }, 1000);
        }
    }, [queryString, note])

    function handleChange(html) {
        setEditorHtml(html);
        setNote({
            ...note,
            content: html,
        });
    }

    async function runQuery(query) {
        setRunningQuery(true);
        // const placeholderText = "Running query to GPT...";
        // editorHtml.replace(queryString, placeholderText);
        // setEditorHtml(editorHtml);

        console.log("runQuery", query);
        const response = await client.openai.queryPromptedPrompt.query([{
            role: 'system',
            content: "You are a data retriever. For any prompt you should only return data. Do not respond as if you were an entity, just return the data you found when processing the query."
        },
        {
            role: 'user',
            content: query,
        }])
        console.log("response", response);
        return response;
        // setQueryString('');
    }

    function handleKeyDown(e) {
        e.stopPropagation();
        const ignoredKeys = ["Shift", "Meta", "Tab"];
        if (ignoredKeys.includes(event.key)) {
            return;
        }
        const charRegex = /[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ ]/;
        if (!charRegex.test(e.key)) {
            return;
        }
        if (e.key == '{') {
            setQueryString('{');
            // } else if (e.key == '}' && queryString != '') {
            //     console.log(editorHtml);
            //     runQuery();
        } else if (queryString != '') {
            if (e.key == 'Backspace') {
                setQueryString(queryString.slice(0, -1));
            } else {
                setQueryString(queryString + e.key);
            }
        }
    }

    return (
        <div className="w-full">
            {queryString}

            <ReactQuill
                theme="snow"
                value={note.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                ref={editorRef}
            // dangerouslySetInnerHTML={{ __html: note.content }}
            />
            {/* {JSON.stringify({
                note, queryString, runningQuery,
            }, null, 2)} */}
        </div>
    );
}