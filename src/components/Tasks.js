import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { subscribeToChannel } from '../lib/ably';
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import TaskItem from './TaskItem';
import TaskBlock from './TaskBlock';
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

  const pointMap = [
    '',
    'shadow-xs',
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
    'shadow-inner',
    'shadow-none'
  ];
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
              labels: [],
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
  let someTaskActive = !!userInfo.activeTaskId;
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
                ? 'lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 !text-sm'
                : 'lg:grid-cols-5 sm:grid-cols-3 gap-4 pt-4'
            } gap-4 pt-4 overflow-x-hidden`}
          >
            {tasks.mapArray((task, index) => {
              let showIcons = editingTask?.id != task.id;
              let isActive = task.id == userInfo.activeTaskId;
              return (
                <TaskBlock
                  key={task.id + index}
                  index={index}
                  task={task}
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                  setActiveTask={activateTask}
                  setActiveTaskIndex={setActiveTaskIndex}
                  setEditingTask={setEditingTask}
                  showIcons={showIcons}
                  isActive={isActive}
                  someTaskActive={someTaskActive}
                  pointMap={pointMap}
                  onlyShowOnHover={onlyShowOnHover}
                  toggleCompletion={toggleCompletion}
                  toggleInProgress={toggleInProgress}
                  activateTask={activateTask}
                  updateTaskMutation={updateTaskMutation}
                />
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
              toggleCompletion={toggleCompletion}
            />
          ))
        )}
        {/* <div ref={(element) => { messageEnd = element; }}></div> */}
      </div>
    </div>
  );
}

export default Tasks;
