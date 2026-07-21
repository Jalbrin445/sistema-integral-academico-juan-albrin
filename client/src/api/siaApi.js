import axios from 'axios';

const siaApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials:true,
    headers: {
        'Content-Type':'application/json',
    },
});

siaApi.interceptors.request.use(
    (config) => {
        const csrfToken = document.cookie
            .split(';')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        
        const mutatingMethods = ['post', 'put', 'patch', 'delete'];
        if (mutatingMethods.includes(config.method?.toLowerCase()) && csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


siaApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403){
            sessionStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        if (error.response?.status === 403 && error.response?.data?.msg?.includes('CSRF')) {
            window.location.reload();
        }
        return Promise.reject(error);
    }
);


export default siaApi;