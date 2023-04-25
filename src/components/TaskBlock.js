export default function TaskBlock({
  task,
  activateTask,
  editingTask,
  setEditingTask,
  api,
  estimateDisplay,
  setTasks,
  toggleInProgress,
  toggleCompletion,
  client,
  updateTaskMutation,
  isActive,
  deleteTaskMutation,
  pointMap,
  userInfo,
  showIcons,
  onlyShowOnHover,
  someTaskActive,
  index
}) {
  return (
    <div
      key={task.id}
      className={`relative aspect-w-1 aspect-h-1 shadow-gray-500 transition-height duration-1000 ease-in-out
  ${pointMap[task.pointValue]}
  ${someTaskActive && !isActive && 'transform transition duration-300 hidden'} 
  ${isActive && 'absolute top-3 left-3'}`}
      style={{ aspectRatio: '6 / 5' }}
    >
      <div
        className={`group bg-dark-blue border h-full border-gray-700 cursor-pointer hover:bg-gray-600 rounded      
  ${task.id == userInfo.activeTaskId ? '!bg-blue-950' : ''}
  ${task.labels.includes('completed') ? 'bg-green' : ''}
  ${task.labels.includes('in-progress') ? '!bg-orange-800' : ''}
  `}
        onClick={() => activateTask(task, index)}
      >
        <div
          className={`group flex h-full flex-col justify-center gap-4 ${
            editingTask?.id == task.id ? '' : 'p-3'
          }`}
        >
          {editingTask?.id != task.id ? (
            <span>{task.content || '|' + task.name + '|'}</span>
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
                        tasks.map(t => (t.id != task.id ? t : editingTask))
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
            className={`w-full flex items-center absolute top-3 left-3 space-x-2`}
          >
            {Array(task.pointValue)
              .fill()
              .map((_, index) => {
                console.log(task.id, index);
                return <span key={index}>*</span>;
              })}
          </div>
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
              className={`fa-solid fa-clock cursor-pointer text-gray-light w-5 h-5 mr-auto ml-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
              onClick={e => {
                e.stopPropagation();
                task._editingTimeEstimate = !task._editingTimeEstimate;
              }}
            ></i>
            <span className='text-gray-light text-xs absolute text-center top-1 left-1/2 transform -translate-x-1/2'>
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
            <span className={`items-center text-gray-light w-5 h-5`}>
              <i
                className={`fa-solid fa-arrow-right cursor-pointer text-gray-light w-5 h-5 absolute transform transition duration-300 hover:scale-125 hover:font-bold`}
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
              className={`fa-solid fa-edit cursor-pointer text-gray-light w-5 h-5 ml-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
              onClick={e => {
                e.stopPropagation();
                editingTask?.id != task.id
                  ? setEditingTask(task)
                  : setEditingTask(null);
              }}
            ></i>
          </div>
          <div
            className={`w-full flex items-center justify-between absolute top-1/2 left-0 ${
              !showIcons && 'hidden'
            } ${
              onlyShowOnHover && !isActive
                ? 'invisible group-hover:visible'
                : ''
            }`}
          >
            <span></span>
            <span className='flex items-center justify-center flex-col'>
              <i
                className={`fa-solid fa-plus cursor-pointer text-gray-light w-5 h-5 ml-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                onClick={e => {
                  e.stopPropagation();
                  task.pointValue += 1;
                  updateTaskMutation.mutate({
                    id: task.id,
                    pointValue: task.pointValue
                  });
                }}
              ></i>
              <i
                className={`fa-solid fa-minus cursor-pointer text-gray-light w-5 h-5 mr-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
                onClick={e => {
                  e.stopPropagation();
                  task.pointValue -= 1;
                  updateTaskMutation.mutate({
                    id: task.id,
                    pointValue: task.pointValue
                  });
                }}
              ></i>
            </span>
            {/* <span></span> */}
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
              className={`fa-solid fa-close cursor-pointer text-gray-light w-5 h-5 mr-auto ml-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
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
            <span className={`items-center text-gray-light w-5 h-5`}>
              <i
                className={`fa-solid fa-circle-half-stroke cursor-pointer text-gray-light w-5 h-5 absolute transform transition duration-300 hover:scale-125 hover:font-bold`}
                onClick={e => toggleInProgress(task, e)}
              ></i>
            </span>
            <i
              className={`fa-solid ${
                task.labels.includes('completed') ? 'fa-undo' : 'fa-check'
              } cursor-pointer text-gray-light w-5 h-5 ml-auto mr-3 transform transition duration-300 hover:scale-125 hover:font-bold`}
              onClick={e => toggleCompletion(task, e)}
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
}
