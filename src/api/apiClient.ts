// src/api/apiClient.ts

import axios from 'axios';

// Use the Vite proxy during development
const baseURL = import.meta.env.VITE_API_URL


const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// This interceptor adds the final auth token to every authenticated request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('finalAuthToken');
        if (token) {
            // This line is crucial
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;