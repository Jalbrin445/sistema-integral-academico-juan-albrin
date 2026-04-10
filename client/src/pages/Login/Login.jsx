import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

function Login() {
    const [nombre_usuario, setNombreUsuario] = useState('');
    const [contrasena, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(nombre_usuario, contrasena);
        } catch (err) {
            const mensajeServidor = err.response?.data?.msg || "Error al conectar con el servidor";
            setError(mensajeServidor);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Iniciar Sesión</h2>
                
                
                {error && (
                    <p style={{ 
                        color: '#842029', 
                        backgroundColor: '#f8d7da', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        fontSize: '0.85rem',
                        border: '1px solid #f5c2c7',
                        marginBottom: '15px'
                    }}>
                        {error}
                    </p>
                )}

                <form onSubmit={manejarEnvio} autoComplete="off">
                    <div>
                        <label>Nombre de Usuario</label>
                        <input 
                            type="text" 
                            value={nombre_usuario} 
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-olvidaste-contrasena">
                        <p>
                            <Link to="/OlvidoContrasena">¿Olvidaste tu contraseña?</Link>
                        </p>
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
}

export default Login;