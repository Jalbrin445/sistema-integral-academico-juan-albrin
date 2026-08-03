import axios from 'axios';

const siaApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://sia-api.onrender.com/api' : 'http://localhost:5000/api'),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ELIMINADO: Interceptor CSRF (backend lo tiene desactivado)
// Si en el futuro activas CSRF en el backend, vuelve a añadirlo

siaApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403){
            sessionStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default siaApi;