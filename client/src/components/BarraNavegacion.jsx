import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function BarraNavegacion() {
    const { logout, user } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/MenuPrincipal">
                    <span className="logo-icon">🎓</span>
                    <span className="logo-text">INSTANDES</span>
                </Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/MenuPrincipal"><i className="bi bi-house-door"></i> Inicio</Link></li>
                <li><Link to="/InformacionPersonal"><i className="bi bi-person-circle"></i> Mi Perfil</Link></li>
                <li className="user-badge">
                    
                    <button onClick={logout} className="btn-logout-modern">
                        <i className="bi bi-box-arrow-right"></i> Salir
                    </button>
                </li>
            </ul>
        </nav>
    );
}
export default BarraNavegacion;