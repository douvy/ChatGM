import { useState, useRef } from 'react';
import Image from 'next/image';
import { client } from '../trpc/client';
import cloudinaryUpload from '../utils/cloudinaryUpload';
import { trpc } from '../utils/trpc';
import FeatureToggle from './FeatureToggle';

function MyAccount({ userInfo, setUserInfo }) {
  const scrollContainer = useRef(null);
  const [localUserInfo, setLocalUserInfo] = useState(userInfo);
  const [avatarUrl, setAvatarUrl] = useState(
    userInfo.avatarSource || '/avatar.png'
  );
  const [saveState, setSaveState] = useState('unsaved');
  const fileInputRef = useRef();
  const updateAvatarMutation = trpc.users.updateAvatar.useMutation();

  const updateUsernameValue = event => {
    setLocalUserInfo({
      ...localUserInfo,
      username: event.target.value
    });
  };

  const updateTodoistApiKeyValue = event => {
    setLocalUserInfo({
      ...localUserInfo,
      todoistApiKey: event.target.value
    });
  };

  const updateTelegramUserId = event => {
    setLocalUserInfo({
      ...localUserInfo,
      telegramUserId: event.target.value
    });
  };

  const updateGPT4APIKeyValue = event => {
    setLocalUserInfo({
      ...localUserInfo,
      gpt4ApiKey: event.target.value
    });
  };

  const updateDefaultHomepage = event => {
    setLocalUserInfo({
      ...localUserInfo,
      defaultHomepage: event.target.value
    });
  };

  const saveUserUpdates = e => {
    e.preventDefault();
    setSaveState('saving');
    client.users.update.query(localUserInfo).then(data => {
      setSaveState('saved');
      setUserInfo({
        ...localUserInfo
      });
    });
  };

  const changeAvatar = () => {
    fileInputRef.current.click();
  };

  const handleAvatarSelection = event => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);

      handleAvatarChange(file);
    }
  };

  const handleAvatarChange = async file => {
    const imageUrl = await cloudinaryUpload(file);
    const result = await updateAvatarMutation.mutate(imageUrl);
    console.log(result);
    // Save the new avatar URL to your back-end or update your state as needed
  };

  const handleFormSubmit = async event => {
    event.preventDefault();

    const file = event.target.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('upload_preset', 'bssaeyfu');
    formData.append('file', file);

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnzmuwzf4/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);
      const result = await updateAvatarMutation.mutate(data.secure_url);

      // Process the response data as needed
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='mx-auto max-w-[760px] mt-3 md:mt-5' id='my-account'>
      <h1 className='hidden text-title font-medium uppercase mb-5 text-white tracking-wide md:block'>
        Account Information
      </h1>
      <div className='flex w-full flex-row gap-x-6'>
        <div
          className='relative h-[20px] w-[80px] cursor-pointer gap-10 border border-white/20 hover:border-white/40 lg:h-[104px] lg:w-[104px]'
          onClick={changeAvatar}
        >
          <Image
            src={avatarUrl}
            alt='profile picture'
            layout='fill'
            objectFit='cover'
            className='rounded'
          />
          <form>
            <input
              ref={fileInputRef}
              onChange={handleFormSubmit}
              className='hidden'
              type='file'
              accept='image/*'
            />
          </form>
        </div>
        <div className='flex flex-col gap-2'>
          <span className='text-lg uppercase leading-4 text-white tracking-wide'>
            {localUserInfo.username}
          </span>
          <span className='text-2xs uppercase tracking-wide text-white/60'></span>
          <div className='mt-auto'>
            <div className='flex flex-row gap-4'>
              <button
                className='relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border rounded border-transparent text-white btn-gray bg-dark'
                onClick={changeAvatar}
              >
                Change
              </button>
              <button className='relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border rounded border-red text-red btn-red bg-dark hover:text-black'>
                Remove
              </button>
            </div>
          </div>
        </div>
        <input type='hidden' name='delete' value='false' />
      </div>

      <div className='flex w-full flex-row gap-x-6 mt-10'>
        <form className='flex w-full max-w-measure flex-col'>
          <div className='flex flex-col gap-2'>
            <div className='text-sm text-white font-semibold capitalize tracking-wide flex w-full flex-col items-stretch justify-center'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='username'
              >
                <div className='flex items-center justify-between'>
                  <p className='flex items-center justify-start gap-2 px-0.5'>
                    Username*
                  </p>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    value={localUserInfo.username}
                    onChange={updateUsernameValue}
                    onKeyDown={e => e.stopPropagation()}
                    className='h-10 w-full border-1 rounded bg-dark-gray py-2 px-4 text-sm outline-none bg-dark text-white'
                    name='username'
                    id='username'
                  />
                </div>
              </label>
            </div>
          </div>
          <div className='flex flex-col gap-2 border-1'>
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center form-field border-1'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='use-tasks'
              >
                <div className='flex items-center justify-between border-1 round'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide border-1'>
                    Use tasks feature
                  </p>
                  <div className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={localUserInfo.includeTaskFeature}
                      onChange={() => {
                        setLocalUserInfo({
                          ...localUserInfo,
                          includeTaskFeature: !localUserInfo.includeTaskFeature
                        });
                      }}
                      className='toggle-switch-checkbox'
                      name='use-tasks'
                      id='use-tasks'
                    />
                    <label className='toggle-switch-label' htmlFor='use-tasks'>
                      <span className='toggle-switch-inner'></span>
                      {/* <span className="toggle-switch-switch"></span> */}
                    </label>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div
            className={`${
              !localUserInfo.includeTaskFeature ? 'hidden' : ''
            } flex flex-col gap-2`}
          >
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='email'
              >
                <div className='flex items-center justify-between'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide'>
                    Todoist API key
                  </p>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    value={localUserInfo.todoistApiKey}
                    onChange={updateTodoistApiKeyValue}
                    onKeyDown={e => e.stopPropagation()}
                    className='h-10 w-full border-1 bg-dark-gray py-2 px-4 text-sm outline-none bg-dark text-white rounded'
                    name='todoist-api'
                    id='todoist-api'
                  />
                </div>
              </label>
            </div>
          </div>
          <div className='flex flex-col gap-2 border-1'>
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center form-field border-1'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='use-tasks'
              >
                <div className='flex items-center justify-between border-1'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide border-1'>
                    Enable ChatGM Telegram bot
                  </p>
                  <div className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={localUserInfo.enableChatGMBot}
                      onChange={() => {
                        setLocalUserInfo({
                          ...localUserInfo,
                          enableChatGMBot: !localUserInfo.enableChatGMBot
                        });
                      }}
                      className='toggle-switch-checkbox'
                      name='use-bot'
                      id='use-bot'
                    />
                    <label className='toggle-switch-label' htmlFor='use-bot'>
                      <span className='toggle-switch-inner'></span>
                      {/* <span className="toggle-switch-switch"></span> */}
                    </label>
                  </div>
                </div>
              </label>
            </div>
          </div>
          {!localUserInfo.telegramUserId && (
            <div
              className={`${
                !localUserInfo.enableChatGMBot ? 'hidden' : ''
              } flex flex-col gap-2`}
            >
              <a
                href='https://t.me/ChatGoodMorningBot'
                target='_blank'
                className='text-sm flex flex-col gap-2 border-1'
              >
                Get your Telegram User ID here
              </a>
            </div>
          )}
          <div
            className={`${
              !localUserInfo.enableChatGMBot ? 'hidden' : ''
            } flex flex-col gap-2`}
          >
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='email'
              >
                <div className='flex items-center justify-between'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide'>
                    Telegram User ID
                  </p>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    value={localUserInfo.telegramUserId}
                    onChange={updateTelegramUserId}
                    onKeyDown={e => e.stopPropagation()}
                    className='h-10 w-full border-1 bg-dark-gray py-2 px-4 text-sm outline-none bg-dark text-white rounded'
                    name='todoist-api'
                    id='todoist-api'
                  />
                </div>
              </label>
            </div>
          </div>
          <div className='flex flex-col gap-2 border-1'>
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center form-field border-1'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='use-gpt4'
              >
                <div className='flex items-center justify-between border-1'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide border-1'>
                    Use GPT4
                  </p>
                  <div className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={localUserInfo.useGPT4}
                      onChange={() => {
                        setLocalUserInfo({
                          ...localUserInfo,
                          useGPT4: !localUserInfo.useGPT4
                        });
                      }}
                      className='toggle-switch-checkbox'
                      name='use-gpt4'
                      id='use-gpt4'
                    />
                    <label className='toggle-switch-label' htmlFor='use-gpt4'>
                      <span className='toggle-switch-inner'></span>
                      {/* <span className="toggle-switch-switch"></span> */}
                    </label>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div
            className={`${
              !localUserInfo.useGPT4 ? 'hidden' : ''
            } flex flex-col gap-2`}
          >
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='email'
              >
                <div className='flex items-center justify-between'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide'>
                    GPT4 API key
                  </p>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    value={localUserInfo.gpt4ApiKey}
                    onChange={updateGPT4APIKeyValue}
                    onKeyDown={e => e.stopPropagation()}
                    className='h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-dark text-white'
                    name='todoist-api'
                    id='todoist-api'
                  />
                </div>
              </label>
            </div>
          </div>
          <div className={`${false ? 'hidden' : ''} flex flex-col gap-2`}>
            <div className='gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center'>
              <label
                className='flex cursor-pointer flex-col gap-2'
                htmlFor='email'
              >
                <div className='flex items-center justify-between'>
                  <p className='flex items-center justify-start gap-2 px-0.5 tracking-wide'>
                    Default homepage
                  </p>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    value={localUserInfo.defaultHomepage}
                    onChange={updateDefaultHomepage}
                    onKeyDown={e => e.stopPropagation()}
                    className='h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-dark text-white'
                    name='todoist-api'
                    id='todoist-api'
                  />
                </div>
              </label>
            </div>
          </div>
          <FeatureToggle
            label='Enable notepad'
            slug='use-notepad'
            checked={localUserInfo.includeNotepad}
            onChange={() => {
              setLocalUserInfo({
                ...localUserInfo,
                includeNotepad: !localUserInfo.includeNotepad
              });
            }}
          ></FeatureToggle>
          <button
            onClick={saveUserUpdates}
            className={`${
              saveState == 'saved'
                ? 'saved'
                : saveState == 'saving'
                ? 'saving'
                : ''
            } relative mt-6 px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 bg-dark hover:text-black px-6 py-2 mb-8`}
          >
            {' '}
            {saveState == 'saved' ? (
              'Saved'
            ) : saveState == 'saving' ? (
              <span className='spinner'></span>
            ) : (
              'Save changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MyAccount;
