import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from '../lib/ably';
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import TaskItem from './TaskItem';
import NewTask from './NewTask';
import ProjectListItem from './ProjectListItem';
import { TodoistApi } from '@doist/todoist-api-typescript';
import { Card, Row } from 'flowbite-react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { map } from '@trpc/server/observable';
import { LinkedList } from '../lib/LinkedList';

function Tasks({
  userInfo,
  setUserInfo,
  tasks,
  setTasks,
  activeProject,
  setActiveProject,
  projects,
  setProjects,
  c,
  settings
}) {
  const api = new TodoistApi(userInfo.todoistApiKey);
  const scrollContainer = useRef(null);
  const channelRef = useRef(null);
  const textareaRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [activeTask, setActiveTask] = useState();
  const [activeTaskIndex, setActiveTaskIndex] = useState();
  const [addingTask, setAddingTask] = useState(false);
  const [taskHash, setTaskHash] = useState({});
  const [editingTask, setEditingTask] = useState();
  const [submitTaskLock, setSubmitTaskLock] = useState(false);
  const [headTask, setHeadTask] = useState(null);
  const setActiveTaskMutation = trpc.users.setActiveTask.useMutation();
  const setActiveProjectMutation = trpc.users.setActiveProject.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation();
  const updateTaskMutation = trpc.tasks.update.useMutation();
  const updateSwappedMutation = trpc.tasks.updateSwapped.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const router = useRouter();

  const estimateDisplay = seconds => {
    let duration = moment.duration(seconds, 'seconds');
    return moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
  };

  useEffect(() => {}, [userInfo.hideProjectHeader]);

  useEffect(() => {
    // Check if 'c' is not null before accessing its 'key' property
    if (c && router.asPath == '/tasks') {
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
        case 'ArrowLeft':
          if (c.e.shiftKey) {
            const node1 = tasks.indexMap[userInfo.activeTaskId];
            const node2 = node1.prev;
            if (!node2) return;

            const saveableValues = tasks.swap(node1, node2);
            console.log('saveableValues', saveableValues);
            updateSwappedMutation.mutate(saveableValues);

            setTasks(new LinkedList(tasks.toArray()));
          }
          break;
        case 'ArrowRight':
          if (c.e.shiftKey) {
            const node1 = tasks.indexMap[userInfo.activeTaskId];
            const node2 = node1.next;
            if (!node2) return;

            const saveableValues = tasks.swap(node2, node1);
            updateSwappedMutation.mutate(saveableValues);

            setTasks(new LinkedList(tasks.toArray()));
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

  // useEffect(() => {
  //   if (userInfo.activeProjectId == activeProject?.id) return;
  //   if (projects.length == 0 || !userInfo.activeProjectIdq) {
  //     if (!userInfo.activeProjectId) {
  //       api
  //         .getProjects()
  //         .then(projects => setProjects(projects))
  //         .catch(err => console.log(err));
  //     } else {
  //       api.getProject(userInfo.activeProjectId).then(project => {
  //         // setActiveProject(project);
  //       });
  //     }
  //   }
  // }, [userInfo.activeProjectId]);

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  const resetOrdering = async () => {
    const tasks = await client.tasks.query.query({
      projectId: activeProject.id
    });
    console.log('tasks', tasks);
    let prevTaskId = null;
    tasks.map(task => {
      console.log('prevTaskId', prevTaskId);
      client.tasks.update.mutate({
        id: task.id,
        prevTaskId: prevTaskId
      });
      prevTaskId = task.id;
      console.log('prevTaskId', prevTaskId);
    });
  };
  if (window) {
    window.resetOrdering = resetOrdering;
  }

  useEffect(() => {
    if (!activeProject) {
      return;
    }
    if (userInfo.activeProjectId != activeProject.id) {
      setUserInfo({
        ...userInfo,
        activeProjectId: activeProject.id
      });
      setActiveProjectMutation.mutate(activeProject.id);
    }
    api
      .getTasks({
        projectId: activeProject.id,
        priority: 1
      })
      .then(async tasks => {
        const sorted = await client.tasks.queryRawSorted.query({
          projectId: activeProject.id
        });

        const indexed = tasks.reduce((obj, task) => {
          obj[task.id] = task;
          return obj;
        }, {});

        let merged = sorted.map(
          task => (
            (indexed[task.id] = {
              ...indexed[task.id],
              ...task
            }),
            {
              ...indexed[task.id]
            }
          )
        );
        console.log('merged', merged);
        let list = new LinkedList(merged);
        setTasks(list);
        setHeadTask(merged[0]);
        setTaskHash(indexed);
      })
      .catch(err => console.log(err));
  }, [activeProject?.id]);

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
            : [...task.labels, 'completed'].filter(
                label => label != 'in-progress'
              )
        })
        .then(updatedTask => {
          setTasks(tasks.map(t => (t.id != task.id ? t : updatedTask)));
        })
        .catch(err => console.log(err))
  );

  const toggleInProgress = (task, e) => (
    e && e.stopPropagation(),
    task &&
      api
        .updateTask(task.id, {
          labels: task.labels.includes('in-progress')
            ? task.labels.filter(label => label != 'in-progress')
            : [...task.labels, 'in-progress'].filter(
                label => label != 'completed'
              )
        })
        .then(updatedTask => {
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
  let onlyShowOnHover = true;
  return (
    <div className='mx-auto h-full p-4 pt-0'>
      <div className='overflow-y-auto' ref={scrollContainer}>
        {projects
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
        {settings.taskLayout == 'grid' ? (
          <div
            className={`grid ${
              userInfo.hideSidebar
                ? 'lg:grid-cols-6 sm:grid-cols-4 xs:grid-cols-3 !text-sm'
                : 'grid-cols-4'
            } gap-4 pt-4`}
          >
            {tasks.mapArray((task, index) => {
              let showIcons = editingTask?.id != task.id;
              let isActive = task.id == userInfo.activeTaskId;
              return (
                <div
                  key={task.id}
                  className='relative aspect-w-1 aspect-h-1'
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <div
                    className={`group bg-dark-blue border h-full border-gray-700 cursor-pointer hover:bg-gray-600      
                  ${task.id == userInfo.activeTaskId ? '!bg-blue-950' : ''}
                  ${task.labels.includes('completed') ? '!bg-green-950' : ''}
                  ${task.labels.includes('in-progress') ? '!bg-orange-800' : ''}
                  `}
                    onClick={() => activateTask(task, index)}
                  >
                    <div
                      className={`group flex h-full flex-col justify-center gap-4 ${
                        editingTask?.id == task.id ? '' : 'p-2'
                      }`}
                    >
                      {editingTask?.id != task.id ? (
                        <span>{task.content}</span>
                      ) : (
                        <textarea
                          value={editingTask.content}
                          placeholder={editingTask.content}
                          onChange={e => (
                            e.stopPropagation(),
                            setEditingTask({
                              ...editingTask,
                              content: e.target.value
                            })
                          )}
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Escape') {
                              setEditingTask(null);
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (submitTaskLock) {
                                return;
                              }
                              api
                                .updateTask(task.id, {
                                  content: editingTask.content
                                })
                                .then(updatedTask => {
                                  setTasks(
                                    tasks.map(t =>
                                      t.id != task.id ? t : editingTask
                                    )
                                  );
                                  client.tasks.updateWhere.mutate({
                                    where: {
                                      id: editingTask.id
                                    },
                                    data: {
                                      name: editingTask.content
                                    }
                                  });
                                  setEditingTask(null);
                                  setSubmitTaskLock(false);
                                })
                                .catch(err => console.log(err));

                              // create an extension in our database
                            }
                          }}
                          className='w-full h-full p-2 mr-2 bg-dark text-sm p-0 m-0 focus:ring-transparent !bg-inherit'
                          style={{
                            resize: 'none',
                            overflow: 'auto'
                          }}
                          conversationId={undefined}
                          textareaRef={textareaRef}
                          autoFocus={true}
                          onFocus={e => {
                            const {
                              target,
                              target: {
                                value: { length }
                              }
                            } = e;
                            target.setSelectionRange(length, length);
                          }}
                        />
                      )}
                      <div
                        className={`w-full flex items-center justify-between absolute top-3 left-0 ${
                          !showIcons && 'hidden'
                        } ${
                          onlyShowOnHover && !isActive
                            ? 'invisible group-hover:visible'
                            : ''
                        }`}
                      >
                        <i
                          className={`fa-solid fa-clock cursor-pointer text-gray w-5 h-5 mr-auto ml-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                          onClick={e => {
                            e.stopPropagation();
                            task._editingTimeEstimate =
                              !task._editingTimeEstimate;
                          }}
                        ></i>
                        <span className='text-gray text-xs absolute text-center top-1 left-1/2 transform -translate-x-1/2'>
                          {!task._editingTimeEstimate ? (
                            task.timeEstimate ? (
                              estimateDisplay(task.timeEstimate)
                            ) : (
                              ''
                            )
                          ) : (
                            <input
                              type='string'
                              autofocus={true}
                              onFocus={() => {
                                this.setSelectionRange(
                                  this.value.length,
                                  this.value.length
                                );
                              }}
                              className='w-auto cursor-default text-xs text-center border-1 !important text-sm p-0 m-0 focus:ring-transparent !bg-inherit'
                              value={estimateDisplay(task.timeEstimate)}
                              onChange={e => {
                                e.stopPropagation();
                                task.timeEstimate = 1;
                              }}
                              onKeyDown={e => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setTasks(
                                    tasks.map(t => {
                                      if (t.id != task.id) {
                                        return t;
                                      }
                                      return {
                                        ...t,
                                        timeEstimate: e.target.value
                                      };
                                    })
                                  );
                                }
                              }}
                              onClick={e => {
                                e.stopPropagation();
                              }}
                            />
                          )}
                        </span>
                        <span className={`items-center text-gray w-5 h-5`}>
                          <i
                            className={`fa-solid fa-arrow-right cursor-pointer text-gray w-5 h-5 absolute transform transition duration-300 hover:scale-125 hover:font-bold`}
                            onClick={e => {
                              e.stopPropagation();
                              client.tasks.postpone.mutate({
                                taskId: task.id,
                                projectName: activeProject.name
                              });
                            }}
                          ></i>
                        </span>
                        <i
                          className={`fa-solid fa-edit cursor-pointer text-gray w-5 h-5 ml-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                          onClick={e => {
                            e.stopPropagation();
                            editingTask?.id != task.id
                              ? setEditingTask(task)
                              : setEditingTask(null);
                          }}
                        ></i>
                      </div>
                      <div
                        className={`w-full flex items-center justify-between absolute bottom-1 left-0 ${
                          !showIcons && 'hidden'
                        } ${
                          onlyShowOnHover && !isActive
                            ? 'invisible group-hover:visible'
                            : ''
                        }`}
                      >
                        <i
                          className={`fa-solid fa-close cursor-pointer text-gray w-5 h-5 mr-auto ml-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                          onClick={e => (
                            e.stopPropagation(),
                            api
                              .closeTask(task.id)
                              .then(closed => {
                                setTasks(
                                  new LinkedList(
                                    tasks.toArray().filter(t => t.id != task.id)
                                  )
                                );
                                deleteTaskMutation.mutate(task.id);
                              })
                              .catch(err => console.log(err))
                          )}
                        ></i>
                        <span className={`items-center text-gray w-5 h-5`}>
                          <i
                            className={`fa-solid fa-circle-half-stroke cursor-pointer text-gray w-5 h-5 absolute transform transition duration-300 hover:scale-125 hover:font-bold`}
                            onClick={e => toggleInProgress(task, e)}
                          ></i>
                        </span>
                        <i
                          className={`fa-solid ${
                            task.labels.includes('completed')
                              ? 'fa-undo'
                              : 'fa-check'
                          } cursor-pointer text-gray w-5 h-5 ml-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                          onClick={e => toggleCompletion(task, e)}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <NewTask
              addingTask={addingTask}
              setAddingTask={setAddingTask}
              userInfo={userInfo}
              activeProject={activeProject}
              tasks={tasks}
              setTasks={setTasks}
            ></NewTask>
          </div>
        ) : (
          tasks.mapArray((task, index) => (
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
