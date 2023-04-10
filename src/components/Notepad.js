import React, { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false
});

export default function TextEditor({ content, setContent, userInfo, setUserInfo }) {
    const [editorHtml, setEditorHtml] = useState(content);
    const [note, setNote] = useState({
        content: '',
    });
    const timerRef = useRef(null);
    const updateNote = trpc.users.saveNote.useMutation();

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
        console.log("note updated");
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(save, 1000);

        const saveInterval = setInterval(save, 10000);
        // Cleanup the interval on unmount
        return () => clearInterval(saveInterval);

    }, [note]);

    function handleChange(html) {
        setEditorHtml(html);
        setNote({
            ...note,
            content: html,
        });
    }

    return (
        <div className="w-full">
            <ReactQuill
                theme="snow"
                value={editorHtml}
                onChange={handleChange}
            />
        </div>
    );
}