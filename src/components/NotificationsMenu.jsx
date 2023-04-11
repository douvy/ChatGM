export default function NotificationsMenu({ userInfo }) {
  return (
    <div className='absolute right-0 mt-9 w-48 bg-dark border-gray-light rounded-md shadow-lg z-100 dropdown-container bell'>
      <ul className='py-1 text-base leading-6 text-offwhite'>
        <li
          aria-label='Notification'
          className='flex justify-between items-center px-4 py-2 hover-dark cursor-pointer -mx-0 -mt-1 -mb-1'
        >
          <div className='flex items-center'>
            <div className='w-10 h-10 rounded-full overflow-hidden mr-3'>
              <img
                src={userInfo.avatarSource || '/avatar.png'}
                className='rounded-full w-10 h-10'
              />
            </div>
            <div className='flex flex-col'>
              <p className='text-sm text-offwhite'>
                <span>{userInfo?.username}</span> added Josh to a{' '}
                <strong>conversation</strong>
              </p>
              <div className='text-xs text-gray-400 mt-0.5'>
                <span>Funky Chat Frenzy</span>
              </div>
              <p className='text-xs text-gray-500 mt-0.5'>11 hours ago</p>
            </div>
          </div>
          <div>
            <button
              type='button'
              aria-label='Mark as read'
              className='focus:outline-none'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                className='text-gray-500'
              >
                <path
                  fill='currentColor'
                  d='M12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 1a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2.5a2 2 0 110 4 2 2 0 010-4z'
                ></path>
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}
