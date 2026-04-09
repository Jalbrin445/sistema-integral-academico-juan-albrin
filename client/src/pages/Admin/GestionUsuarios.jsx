import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import siaApi from "../../api/siaApi";
import './GestionUsuarios.css';

function GestionUsuarios() {

    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [rolSeleccionado, setRolSeleccionado] = useState(3);
    const [cargando, setCargando] = useState(false);

    const cargarUsuarios = async (idRol) => {
        setCargando(true);

        try {
            const resp = await siaApi.get(`/usuarios/listar-rol/${idRol}`);
            setUsuarios(resp.data);

        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios(rolSeleccionado);

    }, [rolSeleccionado]);

    const toogleEstado = async (id, estadoActual) => {
        const valorActual = Number(estadoActual);
        const nuevoEstado = valorActual === 1 ? 0 : 1;
        const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';

        if (window.confirm(`¿Estas seguro de que deseas ${accion} este usuario`)) {
            try {

                const resp = await siaApi.patch(`/usuarios/estado/${id}`, { activo: nuevoEstado});

                setUsuarios(prevUsuarios => prevUsuarios.map(u =>
                    u.id_usuario === id ? { ...u, activo: nuevoEstado} : u
                ));
                alert(resp.data.msg);
            } catch (error) {
                alert(error.response?.data?.msg || "Error al cambiar el estado");
            }
        }
    };

    return (
        <div className="gestion-usuarios-page">
            <header className="gestion-header">
                <h1>Gestión de Comunidad Educativa</h1>
                <button
                    className="btn-nuevo-usuario"
                    onClick={() => navigate('/MenuPrincipal/admin/usuarios/nuevo')}
                >
                    + Registrar Nuevo
                </button>
                <div className="tab-container">
                    <button className={`tab-btn ${rolSeleccionado === 3 ? 'active': ''}`}
                        onClick={() => setRolSeleccionado(3)}
                    >
                        Estudiantes
                    </button>
                    <button className={`tab-btn ${rolSeleccionado === 2 ? 'active' : ''}`}
                        onClick={() => setRolSeleccionado(2)}
                    >
                        Docentes
                    </button>
                </div>
            </header>
            <div className="tabla-container">
                {cargando ? (
                    <div className="loader">Cargando datos...</div>
                ) : (
                    <table className="sia-table">
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Usuario</th>
                                <th>{rolSeleccionado === 3 ? 'Codigo' : 'Especialidad'}</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id_usuario}>
                                    <td>{u.nombres} {u.apellido_paterno}</td>
                                    <td>{u.nombre_usuario}</td>
                                    <td>{rolSeleccionado === 3 ? u.codigo_estudiante : u.especialidad}</td>
                                    <td>
                                        <span className={`badge ${Number(u.activo) === 1 ? 'bg-success' : 'bg-danger'}`}>
                                            {Number(u.activo) === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => toogleEstado(u.id_usuario, u.activo)} className={`btn-action ${Number(u.activo) === 1 ? 'btn-disable' : 'btn-enable'}`}>
                                            {Number(u.activo) === 1 ? 'Dar de Baja' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )

                }
            </div>
        </div>
    );
}

export default GestionUsuarios;