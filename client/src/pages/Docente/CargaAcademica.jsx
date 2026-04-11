import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Docente.css';

const CargaAcademica = () => {
    const { user, loading } = useContext(AuthContext);
    const [carga, setCarga] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCarga = async () => {

            if (loading || !user?.id) return;
            
            try {
                const token = localStorage.getItem('token');
                // Usamos el ID normalizado (ya sea que viniera como id_docente o id_usuario) 

                const res = await axios.get(`http://localhost:5000/api/asignaciones/docente/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setCarga(res.data);
            } catch (error) {
                console.error("Error al obtener la carga académica:", error);
            }
        };

        fetchCarga();
    }, [user, loading]);

    if (loading) return <div className="text-cente mt-5">Cargando sesión...</div>
    return (
        <div className="docente-seccion container mt-4">
            <h2 className="titulo-seccion mb-4">
                <i className="bi bi-mortarboard-fill"></i> Mi Carga Académica
            </h2>
            <div className="row">
                {carga.length === 0 ? (
                    <div className="col-12 text-center">
                        <p className="text-muted">No tienes materias asignadas actualmente.</p>
                    </div>
                ) : (
                    carga.map((item) => (
                        <div className="col-md-4 mb-3" key={item.id_asignacion}>
                            <div className="card materia-card shadow-sm h-100 p-3">
                                <h5 className="card-title text-primary">{item.nombre_materia}</h5>
                                <p className="label-informativo">Grupo: <strong>{item.nombre_grupo}</strong></p>
                                <p className="label-informativo">Año: {item.anio_escolar}</p>
                                <span className="badge bg-success w-50 mb-3">Activa</span>
                                
                                <button 
                                    className="btn btn-sm btn-primary w-100 mt-auto"
                                    onClick={() => navigate(`/MenuPrincipal/docente/criterios/${item.id_asignacion}/${item.nombre_materia}`)}
                                >
                                    Configurar Criterios
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CargaAcademica;