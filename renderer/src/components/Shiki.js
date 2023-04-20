// components/YourComponent.tsx or components/YourComponent.jsx
import React, { useEffect, useState } from 'react';
import { getHighlighter } from 'shiki';

const ShikiComponent = () => {
  const [result, setResult] = useState(null);

  getHighlighter({});

  useEffect(() => {
    async function fetchData() {
      // Use the package here as needed
    }

    fetchData();
  }, []);

  return (
    <div>
      {/* Render the content of your component */}
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};

export default ShikiComponent;
