import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import siaApi from '../api/siaApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const normalizarUsuario = (datos) => {
        const usuarioBackend = Array.isArray(datos) ? datos[0] : datos;
        if (!usuarioBackend) return null;

        return {
            ...usuarioBackend,
            id: usuarioBackend.id_usuario || usuarioBackend.id_docente || usuarioBackend.docente_id_docente || usuarioBackend.id,
            rol: usuarioBackend.rol_id_rol || usuarioBackend.rol || usuarioBackend.id_rol,
            id_estudiante: usuarioBackend.id_estudiante || null,
            id_docente: usuarioBackend.id_docente || null,
            id_usuario: usuarioBackend.id_usuario || null
        };
    };

    useEffect(() => {
        const verificarSessionActiva = async () => {
            const savedUser = sessionStorage.getItem('user');
            if (!savedUser) {
                setLoading(false);
                return;
            }

            try {
                const resp = await siaApi.get('/auth/verify');
                const datosRaw = resp.data.user;
                const usuarioLimpio = normalizarUsuario(datosRaw);

                if (usuarioLimpio) {
                    setUser(usuarioLimpio);
                    sessionStorage.setItem('user', JSON.stringify(usuarioLimpio));
                } else {
                    sessionStorage.removeItem('user');
                    setUser(null);
                }
            } catch (error) {
                console.warn('⚠️ Sesión no disponible en este momento:', error.response?.status);
                const savedUserData = sessionStorage.getItem('user');
                if (!savedUserData) {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        verificarSessionActiva();
    }, []);

    const login = async (nombre_usuario, contrasena) => {
        try {
            const resp = await siaApi.post('/auth/login', { nombre_usuario, contrasena });
            
            const { user: usuarioBackend } = resp.data;

            const usuarioLimpio = normalizarUsuario(usuarioBackend);

            sessionStorage.setItem('user', JSON.stringify(usuarioLimpio));
            setUser(usuarioLimpio);
            
            navigate('/MenuPrincipal');
        } catch (error) {
            console.error('❌ Error en login:', error);
            console.error('❌ Response:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await siaApi.post('/auth/logout');
        } catch (err) {
            console.error("Error al notificar cierre de sesión:", err);
        } finally {
            sessionStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};