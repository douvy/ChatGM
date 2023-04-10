import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import TaskItem from './TaskItem';
import ProjectListItem from './ProjectListItem';
import { TodoistApi } from '@doist/todoist-api-typescript';

function Tasks({ userInfo, setUserInfo, c }) {
    const api = new TodoistApi(userInfo.todoistApiKey)
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [activeTaskIndex, setActiveTaskIndex] = useState(null);
    const setActiveTaskMutation = trpc.users.setActiveTask.useMutation();
    useEffect(() => {
        console.log("c.key", c.key);
        switch (c.key) {
            case 'ArrowUp':
                if (activeTaskIndex > 0) {
                    setActiveTask(tasks[activeTaskIndex - 1], activeTaskIndex - 1);
                }
                break;
            case 'ArrowDown':
                if (activeTaskIndex < tasks.length - 1) {
                    setActiveTask(tasks[activeTaskIndex + 1], activeTaskIndex + 1);
                }
                break;
        }
    }, [c]);

    if (projects.length == 0) {
        if (!userInfo.activeProjectId) {
            api.getProjects()
                .then((projects) => setProjects(projects)).catch((err) => console.log(err))
        } else {
            api.getProject(userInfo.activeProjectId).then((project) => {
                setProjects([project]);
                setActiveProject(project);
            });
        }

    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
        }
    }

    useEffect(() => {
        console.log(activeProject);
        if (!activeProject) {
            return;
        }
        api.getTasks({
            projectId: activeProject.id,
            priority: 1,
        }).then((tasks) => setTasks(tasks)).catch((err) => console.log(err))
    }, [activeProject])

    const setActiveTask = async (task, index) => {
        const activeTaskId = task.id == userInfo.activeTaskId ? null : task.id;
        setUserInfo({
            ...userInfo,
            activeTaskId: activeTaskId,
            activeTaskSetAt: new Date(),
        })
        setActiveTaskIndex(index);
        const updatedUser = await setActiveTaskMutation.mutateAsync(activeTaskId);
    }

    // let messageEnd = null;
    // useEffect(() => {
    //     messageEnd?.scrollIntoView({ behaviour: "smooth" });
    // }, [conversation]);
    // if (!conversation.messages) {
    //     return <></>
    // }
    return (
        <div className="mx-auto h-full">
            <div className="overflow-y-auto" ref={scrollContainer}>
                {projects.filter((project) => {
                    return activeProject ? project.id == activeProject.id : true;
                }).map((project, index) => {
                    return (
                        <ProjectListItem
                            key={project.id + index}
                            index={index}
                            project={project}
                            setActiveProject={setActiveProject}
                            userInfo={userInfo}
                            setUserInfo={setUserInfo}
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
                            setActiveTask={setActiveTask}
                            setActiveTaskIndex={setActiveTaskIndex}
                        />
                    );
                })}
                {/* <div ref={(element) => { messageEnd = element; }}></div> */}
            </div>
        </div>
    );
}

export default Tasks;
