import { useState } from "react";

export default function Modal({ modalOpen, setModalOpen, children }) {
    const [opacity, setOpacity] = useState(0);

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            setModalOpen(false);
        }
    }

    function handleModalTransitionEnd() {
        if (!modalOpen) {
            setOpacity(0);
        }
    }

    return (
        <div
            className={`${modalOpen ? "opacity-100" : `opacity-${opacity}`
                } fixed z-50 inset-0 overflow-y-auto`}
            style={{ transition: "opacity 0.2s ease-in-out" }}
        >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={handleOverlayClick}
                >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                ></span>
                <div
                    className={`${modalOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                        } inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
                    style={{ transition: "all 0.2s ease-in-out" }}
                    onTransitionEnd={handleModalTransitionEnd}
                >
                    <button
                        className="absolute top-0 right-0 text-gray-500 hover:text-gray-800"
                        onClick={() => {
                            setModalOpen(false);
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    {children}
                </div>
            </div>
        </div >
    );
}
