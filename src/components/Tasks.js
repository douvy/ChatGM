import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from '../lib/ably';
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import TaskItem from './TaskItem';
import ProjectListItem from './ProjectListItem';
import { TodoistApi } from '@doist/todoist-api-typescript';
import { Card, Row } from 'flowbite-react';

function Tasks({ userInfo, setUserInfo, passedTasks, passedActiveProject, c }) {
  const api = new TodoistApi(userInfo.todoistApiKey);
  const scrollContainer = useRef(null);
  const channelRef = useRef(null);
  const textareaRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [submitLocket, setSubmitLock] = useState(false);
  const [tasks, setTasks] = useState(passedTasks || []);
  const [projects, setProjects] = useState(
    passedActiveProject ? [passedActiveProject] : []
  );
  const [activeProject, setActiveProject] = useState(
    passedActiveProject || null
  );
  const [activeTask, setActiveTask] = useState();
  const [activeTaskIndex, setActiveTaskIndex] = useState();
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    content: ''
  });

  const setActiveTaskMutation = trpc.users.setActiveTask.useMutation();

  useEffect(() => {
    // Check if 'c' is not null before accessing its 'key' property
    if (c) {
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
        case 'N':
          setAddingTask(true);
          break;
        case 'Enter':
          toggleCompletion(tasks.find(({ id }) => id == userInfo.activeTaskId));
        // case 'Escape':
        //   setAddingTask(false);
      }
    }
  }, [c]);

  if (projects.length == 0) {
    if (!userInfo.activeProjectId) {
      api
        .getProjects()
        .then(projects => setProjects(projects))
        .catch(err => console.log(err));
    } else {
      api.getProject(userInfo.activeProjectId).then(project => {
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
    api
      .getTasks({
        projectId: activeProject.id,
        priority: 1
      })
      .then(tasks => setTasks(tasks))
      .catch(err => console.log(err));
  }, [activeProject]);

  const activateTask = async (task, index) => {
    const activeTaskId = task.id == userInfo.activeTaskId ? null : task.id;
    setUserInfo({
      ...userInfo,
      activeTaskId: activeTaskId,
      activeTaskSetAt: new Date()
    });
    setActiveTaskIndex(index);
    setActiveTask(task);
    const updatedUser = await setActiveTaskMutation.mutateAsync(activeTaskId);
  };

  const toggleCompletion = (task, e) => (
    e && e.stopPropagation(),
    task &&
      api
        .updateTask(task.id, {
          labels: task.labels.includes('completed')
            ? task.labels.filter(label => label != 'completed')
            : [...task.labels, 'completed']
        })
        .then(updatedTask => {
          console.log(updatedTask);
          setTasks(tasks.map(t => (t.id != task.id ? t : updatedTask)));
        })
        .catch(err => console.log(err))
  );

  // let messageEnd = null;
  // useEffect(() => {
  //     messageEnd?.scrollIntoView({ behaviour: "smooth" });
  // }, [conversation]);
  // if (!conversation.messages) {
  //     return <></>
  // }
  return (
    <div className='mx-auto h-full p-4 pt-0'>
      <div className='overflow-y-auto' ref={scrollContainer}>
        {projects.length != 1 &&
          projects
            .filter(project => {
              return activeProject ? project.id == activeProject.id : true;
            })
            .map((project, index) => {
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
        {true ? (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 '>
            {tasks.map((task, index) => (
              <div key={task.id} className='relative'>
                <div
                  className={`bg-dark-blue h-64 border border-gray-700 cursor-pointer hover:bg-gray-600           
                  ${task.id == userInfo.activeTaskId ? '!bg-blue-950' : ''}
                  ${task.labels.includes('completed') ? '!bg-green-950' : ''}
                  `}
                  onClick={() => activateTask(task, index)}
                >
                  <div className='flex h-full flex-col justify-center gap-4 p-6'>
                    {task.content}
                    <i
                      className={`fa-solid ${
                        task.labels.includes('completed')
                          ? 'fa-undo'
                          : 'fa-check'
                      } cursor-pointer text-gray w-5 h-5 ml-auto mb-3 mr-3 absolute bottom-0 right-0 transform transition duration-300 hover:scale-125 hover:font-bold`}
                      onClick={e => toggleCompletion(task, e)}
                    ></i>
                    <i
                      className={`fa-solid fa-close cursor-pointer text-gray w-5 h-5 mr-auto mb-3 ml-3 absolute bottom-0 left-0 transform transition duration-300 hover:scale-125 hover:font-bold`}
                      onClick={e => (
                        e.stopPropagation(),
                        api
                          .closeTask(task.id)
                          .then(closed => {
                            setTasks(tasks.filter(t => t.id != task.id));
                          })
                          .catch(err => console.log(err))
                      )}
                    ></i>
                  </div>
                </div>
              </div>
            ))}
            <div key='new-task'>
              <div
                className='bg-dark-blue h-64 border border-gray-700 cursor-pointer hover:bg-gray-600'
                onClick={() => setAddingTask(true)}
              >
                <div className='flex h-full flex-col justify-center gap-4 p-6'>
                  {!addingTask ? (
                    <i className='fas fa-plus text-4xl mx-auto'></i>
                  ) : (
                    <AutoExpandTextarea
                      value={newTask.content}
                      onChange={e => (
                        e.stopPropagation(),
                        setNewTask({
                          ...newTask,
                          content: e.target.value
                        })
                      )}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          setAddingTask(false);
                        }
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (submitLocket) {
                            return;
                          }
                          setSubmitLock(true);
                          api
                            .addTask({
                              content: newTask.content,
                              project_id: activeProject.id
                            })
                            .then(task => {
                              setTasks([...tasks, task]);
                              setNewTask({
                                content: ''
                              });
                              setAddingTask(false);
                              setSubmitLock(false);
                            })
                            .catch(err => {
                              console.log(err);
                              setSubmitLock(false);
                            });
                        }
                      }}
                      placeholder=''
                      className='w-full p-2 mr-2 bg-dark border-gray-700 focus:border-gray-800 !important focus:ring-transparent'
                      conversationId={undefined}
                      ref={textareaRef}
                      //   autoFocus={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskItem
              key={task.id + index}
              index={index}
              task={task}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              setActiveTask={activateTask}
              setActiveTaskIndex={setActiveTaskIndex}
            />
          ))
        )}
        {/* <div ref={(element) => { messageEnd = element; }}></div> */}
      </div>
    </div>
  );
}

export default Tasks;
