import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import TaskItem from './TaskItem';
import ProjectListItem from './ProjectListItem';
import { TodoistApi } from '@doist/todoist-api-typescript';

function Tasks({ userInfo, setUserInfo }) {
    console.log("API KEY:", userInfo.todoistApiKey);
    const api = new TodoistApi(userInfo.todoistApiKey)
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);

    if (projects.length == 0) {
        api.getProjects()
            .then((projects) => setProjects(projects)).catch((err) => console.log(err))
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
        }
    }

    useEffect(() => {
        if (!activeProject) {
            return;
        }
        api.getTasks({
            projectId: activeProject.id
        }).then((tasks) => setTasks(tasks)).catch((err) => console.log(err))
    }, [activeProject])

    // let messageEnd = null;
    // useEffect(() => {
    //     messageEnd?.scrollIntoView({ behaviour: "smooth" });
    // }, [conversation]);
    // if (!conversation.messages) {
    //     return <></>
    // }
    return (
        <div className="mx-auto max-w-[760px]">
            <div className="overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {tasks.length == 0 && projects.map((project, index) => {
                    return (
                        <ProjectListItem
                            key={project.id + index}
                            index={index}
                            project={project}
                            setActiveProject={setActiveProject}
                            userInfo={userInfo}
                        />
                    );
                })}
                {tasks.map((task, index) => {
                    return (
                        <TaskItem
                            key={task.id + index}
                            index={index}
                            task={task}
                            userInfo={userInfo}
                            setUserInfo={setUserInfo}
                        />
                    );
                })}
                {/* <div ref={(element) => { messageEnd = element; }}></div> */}
            </div>
        </div>
    );
}

export default Tasks;
