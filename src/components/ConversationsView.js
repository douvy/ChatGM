import { useState } from "react";
import { trpc } from '../utils/trpc';

function ConversationsView({ conversations, setConversations }) {
    const [editingIndex, setEditingIndex] = useState(-1);
    const deleteConversationMutation = trpc.conversations.delete.useMutation();

    const handleEdit = (index) => {
        setEditingIndex(index);
    };

    const handleDelete = async (conversation) => {
        try {
            const response = await deleteConversationMutation.mutate(conversation.id);
            console.log("delete response:", response);
            setConversations(conversations.filter((t) => t.id !== conversation.id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNameChange = (index, value) => {
        const updatedConversations = [...conversations];
        updatedConversations[index] = { ...updatedConversations[index], name: value };
        setConversations(updatedConversations);
    };

    const saveName = (index, name) => {
        const updateName = async () => {
            const id = conversations[index].id;
            try {
                const response = await fetch(`/api/conversations/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: name }),
                });

                if (!response.ok) {
                    throw new Error("Failed to update conversation name.");
                }

                const updatedConversation = await response.json();
                console.log("updatedConversation:", updatedConversation);
                const updatedConversations = [...conversations];
                updatedConversations[index] = updatedConversation;
                setConversations(updatedConversations);
            } catch (error) {
                console.error(error);
            }
        };
        updateName();
    };

    const handleNameSave = (index, event) => {
        if (event.key === "Enter") {
            setEditingIndex(-1);
            const newName = event.target.value;
            saveName(index, newName);
        }
    };

    const handlePublicChange = async (index, event) => {
        const updatedConversations = [...conversations];
        updatedConversations[index] = { ...updatedConversations[index], isPublic: event.target.checked };
        setConversations(updatedConversations);

        const id = conversations[index].id;
        try {
            const response = await fetch(`/api/conversations/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isPublic: updatedConversations[index].isPublic }),
            });

            if (!response.ok) {
                throw new Error("Failed to update conversation.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container flex justify-center mx-auto mt-8">
            <div className="w-full md:w-8/12 mb-8 overflow-hidden-lg" id="conversation-table">
                <div className="w-full overflow-x-auto">
                    <table className="w-full max-w-[760px]">
                        <thead>
                            <tr className="text-md font-semibold tracking-wide text-left uppercase border-b border-gray">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Edit</th>
                                <th className="px-4 py-3">Delete</th>
                                <th className="px-4 py-3">Public</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray">
                            {conversations.map((conversation, index) => (
                                <tr key={index} className="border-gray">
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        {editingIndex === index ? (
                                            <input
                                                type="text"
                                                style={{ backgroundColor: "grey" }}
                                                value={conversation.name}
                                                onChange={(e) =>
                                                    handleNameChange(index, e.target.value, conversation)
                                                }
                                                onKeyDown={(e) => handleNameSave(index, e)}
                                                className="shadow appearance-none border w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                        ) : (
                                            conversation.name
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        {editingIndex !== index && (
                                            <i
                                                className="fas fa-edit cursor-pointer"
                                                onClick={() => handleEdit(index)}
                                            ></i>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        <i
                                            className="fas fa-trash cursor-pointer"
                                            onClick={() => handleDelete(conversation)}
                                        ></i>
                                    </td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        <input
                                            type="checkbox"
                                            checked={conversation.isPublic}
                                            onChange={(e) => handlePublicChange(index, e)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
}

export default ConversationsView;
