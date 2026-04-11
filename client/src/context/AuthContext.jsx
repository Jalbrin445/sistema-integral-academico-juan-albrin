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

    // Función para limpiar y normalizar los datos del usuario
    const normalizarUsuario = (datos) => {
        const usuarioBackend = Array.isArray(datos) ? datos[0] : datos;
        if (!usuarioBackend) return null;

        return {
            ...usuarioBackend,
            id: usuarioBackend.id_usuario || usuarioBackend.id_docente || usuarioBackend.docente_id_docente || usuarioBackend.id,
            rol: usuarioBackend.rol_id_rol || usuarioBackend.rol || usuarioBackend.id_rol
        };
    };

    useEffect(() => {
        const verificarToken = async () => {
            
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const resp = await siaApi.get('/auth/verify');
                const datosRaw = resp.data.user;
                const usuarioLimpio = normalizarUsuario(datosRaw);

                if (usuarioLimpio) {
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

            const usuarioLimpio = normalizarUsuario(usuarioBackend);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(usuarioLimpio));
            setUser(usuarioLimpio);

            setTimeout(() => {
                navigate('/MenuPrincipal');
            }, 100);
        } catch (error) {
            throw error;
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