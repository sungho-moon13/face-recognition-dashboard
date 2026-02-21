import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// ─── Predict / Analyze ─────────────────────────────────────────

export const analyzeImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ─── Register ──────────────────────────────────────────────────

export const registerFace = async (name, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', imageFile);

    const response = await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const registerMultipleFaces = async (name, imageFiles) => {
    const formData = new FormData();
    formData.append('name', name);
    imageFiles.forEach(file => formData.append('files', file));

    const response = await api.post('/register/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ─── User Management ───────────────────────────────────────────

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const getUser = async (name) => {
    const response = await api.get(`/users/${encodeURIComponent(name)}`);
    return response.data;
};

export const updateUser = async (name, newName) => {
    const formData = new FormData();
    formData.append('new_name', newName);

    const response = await api.put(`/users/${encodeURIComponent(name)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteUser = async (name) => {
    const response = await api.delete(`/users/${encodeURIComponent(name)}`);
    return response.data;
};

// ─── Health Check ──────────────────────────────────────────────

export const healthCheck = async () => {
    try {
        const response = await api.get('/../../health', { timeout: 3000 });
        return response.data.status === 'healthy';
    } catch {
        return false;
    }
};

export default api;
