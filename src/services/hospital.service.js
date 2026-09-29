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
    },
    // New method to upload a knowledge document file
    uploadKnowledgeDocs: async (hospitalId, file) => {
        const form = new FormData();
        form.append('file', file);
        const response = await apiClient.post(
            `/hospital/${hospitalId}/file/upload`,
            form,
            {
                headers: {
                    // Let the browser set the multipart boundary
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data; // Expected to contain { id, fileName, fileRef, mimeType, sizeBytes }
    },
};
