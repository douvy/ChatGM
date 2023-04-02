import { useState } from "react";

function ConversationView({ conversations, setConversations }) {
    const [editingIndex, setEditingIndex] = useState(-1);

    const handleEdit = (index) => {
        setEditingIndex(index);
    };

    const handleDelete = async (conversation) => {
        try {
            const response = await fetch(`/api/conversations/${conversation.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete task.");
            }

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

    return (
        <div className="container mx-auto mt-8">
            <div className="w-full mb-8 overflow-hidden-lg" id="conversation-table">
                <div className="w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-md font-semibold tracking-wide text-left uppercase border-b border-gray">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Edit</th>
                                <th className="px-4 py-3">Delete</th>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ConversationView;
