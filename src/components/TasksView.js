import { useState } from "react";

function TaskView({ passedTasks = [] }) {
    const [tasks, setTasks] = useState(passedTasks);

    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskComplete, setNewTaskComplete] = useState(false);

    const addTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/addTask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newTaskName, complete: newTaskComplete })
            });

            if (!response.ok) {
                throw new Error("Failed to add task.");
            }

            setTasks([...tasks, { name: newTaskName, complete: newTaskComplete }]);
            setNewTaskName("");
            setNewTaskComplete(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleComplete = async (index) => {
        try {
            const updatedTasks = [...tasks];
            updatedTasks[index].complete = !updatedTasks[index].complete;
            setTasks(updatedTasks);

            const response = await fetch("/api/updateTask", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedTasks[index])
            });

            if (!response.ok) {
                throw new Error("Failed to update task.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto mt-8">
            <div className="w-full mb-8 overflow-hidden-lg" id="add-task">
                <div className="w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-md font-semibold tracking-wide text-left uppercase border-b border-gray">
                                <th className="px-4 py-3">Task Name</th>
                                <th className="px-4 py-3">Complete</th>
                                <th className="px-4 py-3">Edit</th>
                                <th className="px-4 py-3">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray">
                            {tasks.map((task, index) => (
                                <tr key={index} className="border-gray">
                                    <td className="px-4 py-3 whitespace-no-wrap">{task.name}</td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        <input
                                            type="checkbox"
                                            checked={task.complete}
                                            onChange={() => toggleComplete(index)}
                                            className="cursor-pointer red-checkbox"
                                        />
                                    </td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        <i
                                            className="fas fa-edit cursor-pointer"
                                            onClick={() => handleEdit(index)}
                                        ></i>
                                    </td>
                                    <td className="px-4 py-3 whitespace-no-wrap">
                                        <i
                                            className="fas fa-trash cursor-pointer"
                                            onClick={() => handleDelete(index)}
                                        ></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <form onSubmit={addTask} className="mx-auto max-w-[400px] flex-1 mt-6 md:mt-2">
                <h1 className="font-display text-title font-medium tracking-wide uppercase mt-50 mb-30">Add Task</h1>
                <div className="mb-4">
                    <label htmlFor="name" className="block font-bold mb-2 text-xs font-semibold uppercase italic text-white">
                        Task Name
                    </label>
                    <input
                        type="text"
                        id="taskName"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        className="shadow appearance-none border w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button type="submit" className=" w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline">
                    Add Task
                </button>
            </form>
        </div >
    );
}

export default TaskView;
