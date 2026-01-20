import axios from 'axios';

// Use local proxy to avoid CORS issues
const isDev = process.env.NODE_ENV === 'development'
const baseURL = isDev ? '/api/proxy' : process.env.NEXT_PUBLIC_AI_API_URL

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {     
        'Content-Type': 'application/json',
    },
})

// Add app_code to every request (for production, or if not using proxy)
apiClient.interceptors.request.use((config) => {
    if (!isDev) {
        const appCode = process.env.NEXT_PUBLIC_APP_CODE
        if (appCode) {
            config.params = {
                ...config.params,
                app_code: appCode,
            }
        }
    }
    return config
})