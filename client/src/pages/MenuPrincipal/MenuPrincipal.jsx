import { useContext, useState } from 'react';
import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MENU_OPCIONES } from '../../data/menuOptions';
import './MenuPrincipal.css';

function MenuPrincipal() {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate(); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (loading) return <div>Cargando...</div>;
    if (!user) return <Navigate to="/login" />;

    // LÓGICA DE DETECCIÓN MEJORADA
    const obtenerRolId = () => {
        if (user?.rol_id_rol) return user.rol_id_rol;
        if (user?.id_rol) return user.id_rol;
        
        // Si el backend manda el nombre del rol en vez del ID
        const roles = { 'Administrador': 1, 'Docente': 2, 'Estudiante': 3 };
        return roles[user?.rol] || null;
    };

    const rolId = obtenerRolId();
    const opciones = MENU_OPCIONES[String(rolId)];

    return (
        <div className="menu-layout">
            <aside className={`sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
                <div className="flecha-retorno" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? "❮" : "❯"}
                </div>

                {isSidebarOpen && (
                    <nav className="sidebar-nav">
                        {opciones ? (
                            opciones.map((opcion, index) => (
                                <button key={index} onClick={() => navigate(opcion.path)} className="sidebar-btn">
                                    <span className='sidebar-icon'>🔹</span>
                                    {opcion.label}
                                </button>
                            ))
                        ) : (
                            <p style={{color: 'red', fontSize:'11px', padding: '10px'}}>
                                Rol no reconocido: {user?.rol || 'Nulo'}
                            </p>
                        )}
                    </nav>
                )}
            </aside>

            <main className={`main-content ${isSidebarOpen ? '' : 'full-width'}`}>
                {!isSidebarOpen && <div className="abrir-sidebar" onClick={() => setIsSidebarOpen(true)}>❯</div>}
                <div className='container-dinamico'>
                    <Outlet/>
                </div>
            </main>
        </div>
    );
}

export default MenuPrincipal;