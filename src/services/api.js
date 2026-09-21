import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

let currentAccessToken = null;

export const setAccessToken = (token) => {
    currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

let inflightRefresh = null;

export const silentRefresh = () => {
    if (inflightRefresh) return inflightRefresh;

    inflightRefresh = axios
        .get(`${BASE_API_URL}/auth/refresh`, { withCredentials: true })
        .then(({ data }) => {
            const token = data?.accessToken;
            if (token) setAccessToken(token);
            return token;
        })
        .finally(() => {
            inflightRefresh = null;
        });

    return inflightRefresh;
};

apiClient.interceptors.request.use((config) => {
    if (currentAccessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await silentRefresh();
                return apiClient(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;