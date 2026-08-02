import axios from 'axios';

const apiClient = axios.create({
    // baseURL: import.meta.env.BASE_URL, // Update port if different
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // MUST be true to send/receive httpOnly cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

let currentAccessToken = null;

export const setAccessToken = (token) => {
    currentAccessToken = token;
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use((config) => {
    if (currentAccessToken) {
        config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Silent Refresh Logic
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.get(`${import.meta.env.BASE_URL}/api/auth/refresh`, {
                    withCredentials: true 
                });
                
                setAccessToken(data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                
                return apiClient(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                window.location.href = '/'; // Redirect to login on refresh fail
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;