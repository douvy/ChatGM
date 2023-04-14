export default function Layout({ userInfo, setUserInfo }) {
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-start w-full p-2 pr-3 lg:hidden'>
      <button className='text-red hover:text-red-500 cursor-default'>
        <i
          class='fa-sharp fa-solid fa-bars fa-lg mt-3.5 ml-3 cursor-pointer'
          onClick={() => {
            setUserInfo({
              ...userInfo,
              hideSidebar: !userInfo.hideSidebar
            });
          }}
        ></i>
      </button>
    </div>
  );
}
