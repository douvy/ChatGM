import React, { useState } from 'react';

interface ActiveTaskProps {
    activeTask: any,
}

const ActiveTask: React.FC<ActiveTaskProps> = ({ activeTask }) => {
    const [isMembersExpanded, setIsMembersExpanded] = useState(true);

    // if (!conversation.participants || conversation.participants?.length <= 1) {
    //     return <></>;
    // }

    return (
        <>
            <header className="flex items-center justify-between px-4 py-2 relative cursor-pointer" id="top-nav"
                onClick={(() => {
                    window.open(activeTask.url, '_blank');
                })}>
                {/* Members dropdown title */}
                <div className="flex items-center space-x-2">
                    <div
                    // onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                    >
                        <h1>{activeTask.content}</h1>
                        <h2>{activeTask.description}</h2>

                    </div>
                </div>
                <h1 className="text-xl font-semibold">&nbsp;</h1>
                <nav className="space-x-4">
                    <a href="#" className="hover:text-blue-300"></a>
                </nav>
            </header>
        </>
    );
};

export default ActiveTask;
