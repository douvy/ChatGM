import axios from 'axios';

const cloudinaryUpload = async (file) => {
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
  });

  // const response = await axios.post('/api/avatarUpload', { image: base64Image });
  const response = await fetch("/api/avatarUpload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64Image })
  });

  const data = await response.json();
  return data.avatarUrl;
};

export default cloudinaryUpload;
