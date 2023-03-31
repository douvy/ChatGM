import { useState } from "react";

function FeatureView() {
    const [features, setFeatures] = useState([
        { name: "Feature 1", description: "Description of feature 1." },
        { name: "Feature 2", description: "Description of feature 2." },
        { name: "Feature 3", description: "Description of feature 3." },
    ]);

    const [newFeatureName, setNewFeatureName] = useState("");
    const [newFeatureDescription, setNewFeatureDescription] = useState("");

    const addFeature = (e) => {
        e.preventDefault();
        setFeatures([...features, { name: newFeatureName, description: newFeatureDescription }]);
        setNewFeatureName("");
        setNewFeatureDescription("");
    };

    return (
        <div className="container mx-auto mt-4">
            <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
                <div className="w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-md font-semibold tracking-wide text-left uppercase border-b">
                                <th className="px-4 py-3">Feature Name</th>
                                <th className="px-4 py-3">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {features.map((feature, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 whitespace-no-wrap">{feature.name}</td>
                                    <td className="px-4 py-3 whitespace-pre-wrap">{feature.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <form onSubmit={addFeature} className="mx-auto max-w-[760px] flex-1 mt-6 md:mt-2">
                <div className="mb-4">
                    <label htmlFor="name" className="block font-bold mb-2">
                        Feature Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={newFeatureName}
                        onChange={(e) => setNewFeatureName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="description" className="block font-bold mb-2">
                        Description:
                    </label>
                    <textarea
                        id="description"
                        value={newFeatureDescription}
                        onChange={(e) => setNewFeatureDescription(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Add Feature
                </button>
            </form>
        </div >
    );
}

export default FeatureView;