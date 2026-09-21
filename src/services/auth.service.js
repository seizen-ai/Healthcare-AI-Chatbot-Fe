import apiClient, { setAccessToken, silentRefresh } from './api';

export const authService = {
    signup: async (data) => {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        console.log(response);
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
    },
    refresh: async () => {
        const accessToken = await silentRefresh();
        return { accessToken };
    },
    forgetPassword: async (email) => {
        const response = await apiClient.post('/auth/forget-password', { email });
        return response.data;
    },
    resetPassword: async (token, newPassword, confirmPassword) => {
        const response = await apiClient.post(`/auth/reset-password/${token}`, { newPassword, confirmPassword });
        return response.data;
    }

};