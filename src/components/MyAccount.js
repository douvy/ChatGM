import { useState, useRef } from 'react';
import Image from 'next/image';
import { client } from '../trpc/client';

function MyAccount({ userInfo, setUserInfo }) {
  const scrollContainer = useRef(null);
  const [localUserInfo, setLocalUserInfo] = useState(userInfo);
  const [saveState, setSaveState] = useState('unsaved');

  const updateUsernameValue = (event) => {
    setLocalUserInfo({
      ...localUserInfo,
      username: event.target.value
    });
  }

  const updateTodoistApiKeyValue = (event) => {
    setLocalUserInfo({
      ...localUserInfo,
      todoistApiKey: event.target.value
    });
  }

  const saveUserUpdates = (e) => {
    e.preventDefault();
    setSaveState('saving');
    client.users.update.query(localUserInfo).then((data) => {
      setSaveState('saved');
      setUserInfo({
        ...localUserInfo
      });
    })
  }

  return (
    <div className="mx-auto max-w-[760px] mt-3 md:mt-5" id="my-account">
      <h1 className="hidden text-title font-medium uppercase mb-5 text-white tracking-wide md:block">Account Information</h1>
      <div className="flex w-full flex-row gap-x-6">
        <div className="relative h-[20px] w-[80px] cursor-pointer gap-10 border border-white/20 hover:border-white/40 lg:h-[104px] lg:w-[104px]">
          <Image
            src="/avatar.png"
            alt="profile picture"
            layout="fill"
            objectFit="cover"
          />
          <input className="hidden" type="file" accept="image/*" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg uppercase leading-4 text-white tracking-wide">{localUserInfo.username}</span>
          <span className="text-2xs uppercase tracking-wide text-white/60"></span>
          <div className="mt-auto">
            <div className="flex flex-row gap-4">
              <button className="relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border rounded border-transparent text-white btn-gray bg-transparent">Change</button>
              <button className="relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border rounded border-red text-red btn-red bg-transparent hover:text-black">Remove</button>
            </div>
          </div>
        </div>
        <input type="hidden" name="delete" value="false" />
      </div>

      <div className="flex w-full flex-row gap-x-6 mt-10">
        <form className="flex w-full max-w-measure flex-col">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-white font-semibold capitalize tracking-wide flex w-full flex-col items-stretch justify-center">
              <label className="flex cursor-pointer flex-col gap-2" htmlFor="username">
                <div className="flex items-center justify-between">
                  <p className="flex items-center justify-start gap-2 px-0.5">Username*</p>
                </div>
                <div className="relative">
                  <input type="text" value={localUserInfo.username} onChange={updateUsernameValue} className="h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-transparent text-white" name="username" id="username" />
                </div>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-1">
            <div className="gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center form-field border-1">
              <label className="flex cursor-pointer flex-col gap-2" htmlFor="use-tasks">
                <div className="flex items-center justify-between border-1">
                  <p className="flex items-center justify-start gap-2 px-0.5 tracking-wide border-1">Use tasks feature</p>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={localUserInfo.includeTaskFeature}
                      onChange={(() => {
                        setLocalUserInfo({
                          ...localUserInfo,
                          includeTaskFeature: !localUserInfo.includeTaskFeature
                        });
                      })}
                      className="toggle-switch-checkbox"
                      name="use-tasks"
                      id="use-tasks"
                    />
                    <label className="toggle-switch-label" htmlFor="use-tasks">
                      <span className="toggle-switch-inner"></span>
                      {/* <span className="toggle-switch-switch"></span> */}
                    </label>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className={`${!localUserInfo.includeTaskFeature ? 'hidden' : ''} flex flex-col gap-2`}>
            <div className="gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center">
              <label className="flex cursor-pointer flex-col gap-2" htmlFor="email">
                <div className="flex items-center justify-between">
                  <p className="flex items-center justify-start gap-2 px-0.5 tracking-wide">Todoist API key</p>
                </div>
                <div className="relative">
                  <input type="text" value={localUserInfo.todoistApiKey} onChange={updateTodoistApiKeyValue} className="h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-transparent text-white" name="todoist-api" id="todoist-api" />
                </div>
              </label>
            </div>
          </div>
          <button
            onClick={saveUserUpdates}
            className={`${saveState == 'saved' ? 'saved' : (saveState == 'saving' ? 'saving' : '')} relative mt-6 px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 bg-transparent hover:text-black px-6 py-2`}
          >                    {saveState == 'saved' ? 'Saved' : (saveState == 'saving' ? (<span className="spinner"></span>) : 'Save changes')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MyAccount;