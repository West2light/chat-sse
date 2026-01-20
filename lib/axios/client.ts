import axios from 'axios';

// Always use local proxy to avoid CORS and inject auth headers
const baseURL = '/api/proxy'

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {     
        'Content-Type': 'application/json',
    },
})