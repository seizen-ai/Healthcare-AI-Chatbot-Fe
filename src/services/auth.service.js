import apiClient, { setAccessToken } from './api';

export const authService = {
    signup: async (data) => {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        return response.data;
    },
    verifyEmail: async (token) => {
        const response = await apiClient.get(`/auth/verify-email/${token}`);
        return response.data;
    },
    logout: async () => {
        await apiClient.delete('/auth/logout');
        setAccessToken(null);
    }
};