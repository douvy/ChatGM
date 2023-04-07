import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import TaskItem from './TaskItem';
import { TodoistApi } from '@doist/todoist-api-typescript';

function Tasks({ userInfo }) {
    console.log("API KEY:", userInfo.todoistApiKey);
    const api = new TodoistApi(userInfo.todoistApiKey)
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);
    const [tasks, setTasks] = useState([]);
    api.getTasks()
        .then((tasks) => setTasks(tasks)).catch((err) => console.log(err))

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
                            key={task.id + index}
                            index={index}
                            task={task}
                        />
                    );
                })}
                {/* <div ref={(element) => { messageEnd = element; }}></div> */}
            </div>
        </div>
    );
}

export default Tasks;
