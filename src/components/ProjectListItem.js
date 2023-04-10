import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { trpc } from '../utils/trpc';
import copy from 'clipboard-copy';

function ProjectListItem({ index, project, setActiveProject, userInfo, setUserInfo }) {
  const setActiveProjectMutation = trpc.users.setActiveProject.useMutation();

  return (
    <div className="w-full box cursor-pointer">
      <div className="message p-4 pt-4 relative hover:bg-gray-700" onClick={() => {
        setActiveProject(project);
      }}>
        <img src={'avatar.png'} alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-2" />
        <div className="pl-16 pt-0">
          <span className="text-sm mb-1 inline-block name">{'Project'}</span> <br />
          <p className="text-xs inline-block absolute top-3 right-4 timestamp">
            <span className="message-direction">
              {'Pending'}
              <i
                className={`fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {/* <i className={`fa-star ${false ? 'fa-solid' : 'fa-regular'} ml-2 cursor-pointer`} onClick={() => { }}></i> */}

            <i
              className={`fa-light ${userInfo.activeProjectId == project.id ? 'fa-toggle-on' : 'fa-toggle-off'} hover:font-bold w-5 h-5 ml-2 cursor-pointer`}
              onClick={async (e) => {
                e.stopPropagation();
                const activeProjectId = project.id == userInfo.activeProjectId ? null : project.id;
                await setActiveProjectMutation.mutate(activeProjectId);
                setUserInfo({
                  ...userInfo,
                  activeProjectId: activeProjectId,
                })
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