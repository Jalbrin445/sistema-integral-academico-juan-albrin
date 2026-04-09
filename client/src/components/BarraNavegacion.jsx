import { useContext } from 'react';
import {Link} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function BarraNavegacion(){

    const {logout} = useContext(AuthContext);
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/MenuPrincipal">Mi App</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/MenuPrincipal">Inicio</Link>
                </li>
                <li>
                    <Link to="/InformacionPersonal">Información Personal</Link>
                </li>
                <li>
                    <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
                </li>
            </ul>
        </nav>
    );
}

export default BarraNavegacion;