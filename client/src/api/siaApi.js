import axios from 'axios';

const siaApi = axios.create({
    baseURL: 'http://localhost:5000/api'
});

siaApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

});

export default siaApi;