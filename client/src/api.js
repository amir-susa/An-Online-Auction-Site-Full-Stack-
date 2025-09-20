import axios from 'axios';

// Create an Axios instance with a base URL
const API = axios.create({
  **baseURL: 'https://an-online-auction-site-full-stack-1.onrender.com',** // <-- Updated to your Render deployment URL
});


// Optionally attach token automatically for all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;