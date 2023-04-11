import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ActiveTaskProps {
    activeTask: any,
    userInfo: any,
}

const ActiveTask: React.FC<ActiveTaskProps> = ({ activeTask, userInfo }) => {
    const [isMembersExpanded, setIsMembersExpanded] = useState(true);
    // const [startTime, setStartTime] = useState(new Date(userInfo.activeTaskSetAt));
    const [countdown, setCountdown] = useState('');
    // if (!conversation.participants || conversation.participants?.length <= 1) {
    //     return <></>;
    // }

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const startTime = new Date(userInfo.activeTaskSetAt);
            const diff = Math.max(0, startTime.getTime() + 900000 - now.getTime());
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [userInfo]);

    return (
        <>
            <header className="flex items-center justify-between px-4 py-2 relative cursor-pointer" id="top-nav"
                onClick={(() => {
                    window.open(activeTask.url, '_blank');
                })}>
                {/* Members dropdown title */}
                <div className="w-full items-center space-x-2">
                    <div
                    // onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                    >
                        <div className="text-sm flex justify-between">
                            <span className="font-bold">{activeTask.content}</span>
                            <span className="text-white-500">{countdown}</span>
                        </div>
                        <h2>
                            <ReactMarkdown
                                children={activeTask.description} /></h2>
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
