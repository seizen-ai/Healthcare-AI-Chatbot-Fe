import apiClient from './api';

export const chatbotService = {
    createChatbot: async (chatbotData) => {
        const idempotencyKey = crypto.randomUUID();
        const response = await apiClient.post('/chatbot/create-chatbot', chatbotData, {
            headers: {
                'x-idempotency-key': idempotencyKey,
            },
        });
        return response.data;
    },
    getChatbots: async ({ cursor, limit = 10 } = {}) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        const response = await apiClient.get('/chatbot/get-chatbots', { params });

        const payload = response.data?.data ?? response.data;

        if (Array.isArray(payload)) {
            return { data: payload, nextCursor: null };
        }
        if (payload?.data && Array.isArray(payload.data)) {
            return { data: payload.data, nextCursor: payload.nextCursor ?? null };
        }

        return { data: [], nextCursor: null };
    },
    activateBot: async (chatbotId, payload) => {
        const response = await apiClient.post(`/chatbot/${chatbotId}/activate`, payload);
        return response.data;
    },
    // New method to upload a knowledge document file
    uploadKnowledgeDocs: async (chatbotId, file) => {
        const form = new FormData();
        form.append('file', file);
        const response = await apiClient.post(
            `/chatbot/${chatbotId}/file/upload`,
            form,
            {
                headers: {
                    // Let the browser set the multipart boundary -> we are streaming the file to the blackbaze B2 servers/cloud object storage
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data; // Expected to contain { id, fileName, fileRef, mimeType, sizeBytes }
    },
};
