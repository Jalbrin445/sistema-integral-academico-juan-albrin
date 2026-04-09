import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import siaApi from '../api/siaApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {

    const verificarToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const resp = await siaApi.get('/auth/verify');
                const usuarioBackend = resp.data.user || resp.data.usuario || resp.data;
                const usuarioLimpio = Array.isArray(usuarioBackend) ? usuarioBackend[0] : usuarioBackend;

                if (usuarioLimpio) { 
                    console.log("Usuario verificado:", usuarioLimpio);
                    setUser(usuarioLimpio);
                    localStorage.setItem('user', JSON.stringify(usuarioLimpio));
                }

            } catch (error) {
                console.error("Token no válido o expirado");
                logout();

            } finally {
                setLoading(false);
            }
        };

        verificarToken();
    }, []);

    const login = async (nombre_usuario, contrasena) => {

        try {
            const resp = await siaApi.post('/auth/login', { nombre_usuario, contrasena });
            const { token, user: usuarioBackend } = resp.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(usuarioBackend));
            setUser(usuarioBackend);
            setTimeout(() => {
                navigate('/MenuPrincipal');
            }, 100);

        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al iniciar sesión';
            throw mensaje;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};