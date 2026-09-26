import apiClient from './api';

export const hospitalService = {
    createHospital: async (hospitalData) => {
        const idempotencyKey = crypto.randomUUID();
        const response = await apiClient.post('/hospital/create-hospital', hospitalData, {
            headers: {
                'x-idempotency-key': idempotencyKey,
            },
        });
        return response.data;
    },
    getHospitals: async ({ cursor, limit = 10 } = {}) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        const response = await apiClient.get('/hospital/get-hospitals', { params });

        const payload = response.data?.data ?? response.data;

        if (Array.isArray(payload)) {
            return { data: payload, nextCursor: null };
        }
        if (payload?.data && Array.isArray(payload.data)) {
            return { data: payload.data, nextCursor: payload.nextCursor ?? null };
        }

        return { data: [], nextCursor: null };
    },
    activateBot: async (hospitalId, payload) => {
        const response = await apiClient.post(`/hospital/${hospitalId}/activate`, payload);
        return response.data;
    }
};
