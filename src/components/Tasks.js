import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import TaskItem from './TaskItem';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import { TodoistApi } from '@doist/todoist-api-typescript';

const api = new TodoistApi('')

function Tasks({ }) {
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);
    const [tasks, setTasks] = useState([]);
    api.getTasks()
        .then((tasks) => setTasks(tasks))

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
        }
    }

    // let messageEnd = null;
    // useEffect(() => {
    //     messageEnd?.scrollIntoView({ behaviour: "smooth" });
    // }, [conversation]);
    // if (!conversation.messages) {
    //     return <></>
    // }
    return (
        <div className="mx-auto max-w-[760px]">
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {tasks.map((task, index) => {
                    return (
                        <TaskItem
                            key={conversation.id + index}
                            index={index}
                            task={task}
                        />
                    );
                })}
                {/* <div ref={(element) => { messageEnd = element; }}></div> */}
            </div>
            {/* <form className="flex items-end max-w-[760px] p-4 md:p-4" id="chat-form">
                <AutoExpandTextarea
                    value={newMessage.content}
                    onChange={(updateMessageValue)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="w-full p-2 mr-2 bg-white"
                />
                <span className="button-container">
                    <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                </span>
            </form> */}
        </div>
    );
}

export default Tasks;
