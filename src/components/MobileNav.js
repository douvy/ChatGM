export default function Layout(props) {
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-end w-full p-2 pr-3 lg:hidden'>
      <button className='text-red-400 hover:text-red-500'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          className='h-6 w-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>
    </div>
  );
}
