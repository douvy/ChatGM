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
  const [socketId, setSocketId] = useState(null);
  const [activeTask, setActiveTask] = useState();
  const [activeTaskIndex, setActiveTaskIndex] = useState();
  const [addingTask, setAddingTask] = useState(false);

  const setActiveTaskMutation = trpc.users.setActiveTask.useMutation();
  const setActiveProjectMutation = trpc.users.setActiveProject.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation();

  const router = useRouter();

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
            alert('shift');
          }
          break;
        case 'ArrowRight':
          if (c.e.shiftKey) {
            alert('shift');
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

  useEffect(() => {
    if (projects.length == 0 || !userInfo.activeProjectIdq) {
      if (!userInfo.activeProjectId) {
        api
          .getProjects()
          .then(projects => setProjects(projects))
          .catch(err => console.log(err));
      } else {
        api.getProject(userInfo.activeProjectId).then(project => {
          setActiveProject(project);
        });
      }
    }
  }, [userInfo.activeProjectId]);

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
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
        setTasks(tasks);
        const locallyStoredTasks = await client.tasks.query.query({
          projectId: activeProject.id
        });
        const mapping = locallyStoredTasks.reduce((obj, task) => {
          obj[task.id] = task;
          return obj;
        }, {});
        // const missingLocalTasks = tasks.filter(task => !mapping[task.id]);
        // console.log('missingLocalTasks', missingLocalTasks);
        // missingLocalTasks.forEach(task => {
        //   const missingTask = client.tasks.create.mutate(task);
        //   console.log('created missing local task', missingTask);
        // });
        tasks.forEach(task => {
          if (mapping[task.id]) {
            mapping[task.id] = {
              ...mapping[task.id],
              ...task
            };
          }
        });

        // let prevTaskId = null;
        // let updated = mergedTasks
        //   .reverse()
        //   .map(task => {
        //     if (prevTaskId) task.nextTaskId = prevTaskId;
        //     prevTaskId = task.id;
        //     return task;
        //   })
        //   .reverse();
        // console.log(
        //   'with next:',
        //   updated.map(task => task.nextTaskId)
        // );
        // updated.forEach(task => {
        //   client.tasks.update.mutate({
        //     id: task.id,
        //     nextTaskId: task.nextTaskId
        //   });
        // });
        let ref = activeProject.FIRST;
        if (!ref && tasks.length > 0) {
          client.projects.update.mutate({
            id: activeProject.id,
            FIRST: tasks[0].id
          });
        }
        let orderedTasks = [];
        while (ref) {
          orderedTasks.push(mapping[ref]);
          ref = mapping[ref].nextTaskId;
        }
        console.log('orderedTasks', orderedTasks);
        setTasks(orderedTasks);
        // let nextTaskId = mergedTasks.find(task => !task.nextTaskId)?.id;
        // tasks.map(task => {
        //   task = nextTaskId ? mapping[nextTaskId] : task;
        //   nextTasjkdId = task.nextTasjkdId;

        // };
      })
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
              userInfo.hideSidebar ? 'grid-cols-8' : 'grid-cols-4'
            } gap-4 pt-4`}
          >
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className='relative aspect-w-1 aspect-h-1'
                style={{ aspectRatio: '1 / 1' }}
              >
                <div
                  className={`bg-dark-blue border h-full border-gray-700 cursor-pointer hover:bg-gray-600      
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
                            deleteTaskMutation.mutate(task.id);
                          })
                          .catch(err => console.log(err))
                      )}
                    ></i>
                  </div>
                </div>
              </div>
            ))}
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
