import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { trpc } from '../utils/trpc';
import copy from 'clipboard-copy';

function ProjectListItem({
  index,
  project,
  setActiveProject,
  userInfo,
  setUserInfo
}) {
  const setActiveProjectMutation = trpc.users.setActiveProject.useMutation();
  const [hideProjectHeader, setHideProjectHeader] = useState(
    userInfo.hideProjectHeader && project.id == userInfo.activeProjectId
  );

  useEffect(() => {
    if (project.id == userInfo.activeProjectId) return;
    setHideProjectHeader(userInfo.hideProjectHeader);
    userInfo.update({
      hideProjectHeader: userInfo.hideProjectHeader
    });
  }, [userInfo.hideProjectHeader]);

  return (
    <div
      className={`w-full box cursor-pointer ${hideProjectHeader ? '' : ''}`}
      // style={{
      //   transition: 'z-20 opacity 0.3s ease-out, transform 0.3s ease-out',
      //   opacity: hideProjectHeader ? 0.0 : 1,
      //   transform: hideProjectHeader ? 'translateY(-100%)' : 'translateY(0)'
      // }}
    >
      {userInfo.hideProjectHeader}
      <div
        className={`message relative bg-black hover-dark-blue ${
          project.id == userInfo.activeProjectId ? 'bg-gray-600' : ''
        } ${
          hideProjectHeader
            ? 'transform transition-all duration-300 max-h-0 overflow-y-hidden border-0'
            : 'p-4 pt-4 max-h-100'
        }`}
        onClick={() => {
          setActiveProject(project);
        }}
      >
        <img
          src={'avatar.png'}
          alt='Avatar'
          className='w-9 h-9 rounded-full absolute left-4 top-2'
        />
        <div className='pl-16 pt-0'>
          <span className='text-sm mb-1 inline-block name'>{'Project'}</span>{' '}
          <i
            className={`fa-regular fa-arrow-up fa-sm ml-1 mr-3 mt-2 cursor-pointer text-gray ml-auto transform transition duration-300 hover:scale-125 hover:font-bold`}
            onClick={() => {
              setUserInfo({
                ...userInfo,
                hideProjectHeader: !hideProjectHeader
              });
            }}
          ></i>
          <br />
          <p className='text-xs inline-block absolute top-3 right-4 timestamp'>
            <span className='message-direction'>
              {'Pending'}
              <i
                className={`fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {/* <i className={`fa-star ${false ? 'fa-solid' : 'fa-regular'} ml-2 cursor-pointer`} onClick={() => { }}></i> */}
            <i
              className={`fa-light ${
                userInfo.activeProjectId == project.id
                  ? 'fa-toggle-on'
                  : 'fa-toggle-off'
              } hover:font-bold fa-lg text-gray cursor-pointer`}
              onClick={async e => {
                e.stopPropagation();
                const activeProjectId =
                  project.id == userInfo.activeProjectId ? null : project.id;
                await setActiveProjectMutation.mutate(activeProjectId);
                setUserInfo({
                  ...userInfo,
                  activeProjectId: activeProjectId
                });
                setActiveProject(null);
              }}
            ></i>
          </p>
          {project.name}
          {/* <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={project.name}
            components={customRenderer}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default ProjectListItem;
