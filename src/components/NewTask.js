import { useRef, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { TodoistApi } from '@doist/todoist-api-typescript';
import { trpc } from '../utils/trpc';
import { client } from '@/trpc/client';
import { LinkedList } from '../lib/LinkedList';

export default function NewTask({
  addingTask,
  setAddingTask,
  userInfo,
  activeProject,
  tasks,
  setTasks,
  placeholder = ''
}) {
  const textareaRef = useRef(null);
  const [newTask, setNewTask] = useState({
    content: ''
  });
  const [submitLocket, setSubmitLock] = useState(false);
  const createOrFetchTaskMutation = trpc.tasks.create.useMutation();

  const api = new TodoistApi(userInfo.todoistApiKey);
  return (
    <div key='new-task' style={{ aspectRatio: '1 / 1' }}>
      <div
        className='bg-dark-blue h-full border border-gray-700 cursor-pointer hover:bg-gray-600'
        onClick={() => setAddingTask(true)}
      >
        <div className='flex h-full flex-col justify-center gap-4'>
          {!addingTask ? (
            <i className='fas fa-plus text-4xl mx-auto'></i>
          ) : (
            <textarea
              value={newTask.content}
              placeholder={placeholder}
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
                    .then(async task => {
                      setTasks(new LinkedList([...tasks.toArray(), task]));
                      setNewTask({
                        content: ''
                      });
                      setAddingTask(false);
                      setSubmitLock(false);

                      // create an extension in our database
                      const fetchedTask =
                        await createOrFetchTaskMutation.mutateAsync({
                          projectId: activeProject.id, // more performant
                          content: task.content,
                          id: task.id,
                          project: activeProject,
                          prevTaskId: tasks.tail.value.id
                        });
                      console.log(fetchedTask);
                    })
                    .catch(err => {
                      console.log(err);
                      setSubmitLock(false);
                    });
                }
              }}
              className='w-full h-full p-2 mr-2 bg-dark text-sm p-0 m-0 focus:ring-transparent !bg-inherit'
              style={{
                resize: 'none',
                overflow: 'auto'
              }}
              textarearef={textareaRef}
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
        </div>
      </div>
    </div>
  );
}
