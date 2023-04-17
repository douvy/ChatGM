import { useRef, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import { TodoistApi } from '@doist/todoist-api-typescript';
import { trpc } from '../utils/trpc';
import { client } from '@/trpc/client';

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
        className='bg-dark-blue h-full border border-gray cursor-pointer hover:bg-gray-900 rounded'
        onClick={() => setAddingTask(true)}
      >
        <div className='flex h-full flex-col justify-center gap-4 p-6'>
          {!addingTask ? (
            <i className='fas fa-plus text-4xl mx-auto'></i>
          ) : (
            <AutoExpandTextarea
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
                      setTasks([...tasks, task]);
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
                          project: activeProject
                        });
                      // client.tasks.updateWhere.mutate({
                      //   where: {
                      //     nextTaskId: null
                      //   },
                      //   data: {
                      //     nextTaskId: fetchedTask.id
                      //   }
                      // });
                    })
                    .catch(err => {
                      console.log(err);
                      setSubmitLock(false);
                    });
                }
              }}
              className='w-full p-2 mr-2 bg-dark border-gray-700 focus:border-gray-800 !important focus:ring-transparent'
              conversationId={undefined}
              textareaRef={textareaRef}
              //   autoFocus={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
