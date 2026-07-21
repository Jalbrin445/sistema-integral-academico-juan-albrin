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
            try {
                console.log('🔄 Verificando sesión...');
                const resp = await siaApi.get('/auth/verify');
                console.log('✅ Sesión verificada:', resp.data);
                const datosRaw = resp.data.user;
                const usuarioLimpio = normalizarUsuario(datosRaw);

                if (usuarioLimpio) {
                    setUser(usuarioLimpio);
                    sessionStorage.setItem('user', JSON.stringify(usuarioLimpio));
                    console.log('👤 Usuario cargado:', usuarioLimpio);
                } else {
                    console.log('⚠️ No hay usuario, cerrando sesión');
                    logout();
                }
            } catch (error) {
                console.error('❌ Sesión expirada o no válida:', error.response?.status, error.response?.data);
                logout();
            } finally {
                setLoading(false);
            }
        };

        verificarSessionActiva();
    }, []);

    const login = async (nombre_usuario, contrasena) => {
        console.log('🔑 Intentando login...');
        console.log('📡 URL:', import.meta.env.VITE_API_URL);
        
        try {
            const resp = await siaApi.post('/auth/login', { nombre_usuario, contrasena });
            console.log('✅ Login exitoso - Respuesta:', resp.data);
            
            const { user: usuarioBackend } = resp.data;
            console.log('👤 Usuario recibido del backend:', usuarioBackend);

            const usuarioLimpio = normalizarUsuario(usuarioBackend);
            console.log('👤 Usuario normalizado:', usuarioLimpio);

            sessionStorage.setItem('user', JSON.stringify(usuarioLimpio));
            setUser(usuarioLimpio);
            
            console.log('🚀 Redirigiendo a /MenuPrincipal');
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
            console.log('🚪 Cerrando sesión...');
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