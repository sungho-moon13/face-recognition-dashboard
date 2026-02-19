import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const analyzeImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await axios.post(`${API_URL}/predict`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

export const registerFace = async (name, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', imageFile);

    try {
        const response = await axios.post(`${API_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error registering face:', error);
        throw error;
    }
};
