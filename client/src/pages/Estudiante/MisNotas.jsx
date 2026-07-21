import React, { useState, useEffect, useContext } from 'react';
import siaApi from '../../api/siaApi';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './MisNotas.css';

const MisNotas = () => {
    const { user, loading } = useContext(AuthContext);
    const [resumen, setResumen] = useState([]);
    const [periodos, setPeriodos] = useState([]); // Nuevo: Estado para la lista de periodos
    const [periodoSel, setPeriodoSel] = useState(''); // Nuevo: Estado para el filtro
    const [detalle, setDetalle] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [idEstudiante, setIdEstudiante] = useState(null);

    useEffect(() => {
        if (user) {
            const id = user.id_estudiante || user.id_estudiante_id || user.id;
            setIdEstudiante(id);
        }
    }, [user]);

    useEffect(() => {
        

        const cargarDatosIniciales = async () => {
            if (!idEstudiante) {
                setCargando(false);
                return;
            }
            try {
                setCargando(true);
                
                // Cargamos periodos y resumen inicial en paralelo para ganar velocidad
                const resPer = await siaApi.get('/periodos/activos');
                setPeriodos(resPer.data);
                
                const resRes = await siaApi.get(`/notas/resumen/estudiante/${idEstudiante}`);
                setResumen(resRes.data); 
            
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                if (error.response?.status === 404) {
                    Swal.fire('Info', 'Aún no tienes notas registradas', 'info');
                } else if (error.response?.status === 401) {
                    Swal.fire('Info', 'Aún no tienes notas registradas', 'info');
                } else {
                    Swal.fire('Error', 'Error al cargar tus calificaciones', 'error');
                }
            } finally {
                setCargando(false);
            }
        };

        if (idEstudiante) {
            cargarDatosIniciales();
        }
    }, [idEstudiante]);

    // Función para cambiar de periodo y filtrar las notas
    const cambiarPeriodo = async (idPeriodo) => {
        setPeriodoSel(idPeriodo);
        setCargando(true);
        try {
            // Si hay idPeriodo se filtra, si no, se trae el resumen general
            const url = idPeriodo 
                ? `/notas/resumen/estudiante/${idEstudiante}?periodo=${idPeriodo}`
                : `/notas/resumen/estudiante/${idEstudiante}`;
            
            const res = await siaApi.get(url);
            setResumen(res.data);
            setDetalle(null); // Limpiamos el detalle lateral al cambiar de periodo
        } catch (error) {
            console.error("Error filtrando por periodo:", error);
            Swal.fire('Error', 'Error al filtrar las notas', 'error');
        } finally {
            setCargando(false);
        }
    };

    const verDetalle = async (idAsignacion, nombreMateria) => {
        try {
            setCargando(true);
            const res = await siaApi.get(`/notas/detalle/${idAsignacion}/${idEstudiante}`);
            setDetalle({ 
                nombre: nombreMateria, 
                datos: res.data,
                asignacion: idAsignacion
            });
        } catch (error) {
            console.error("Error cargando detalle:", error);
            Swal.fire('Error', 'Error al cargar el detalle de la materia', 'error');
        } finally {
            setCargando(false);
        }
    };

    if (loading || cargando ) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className='visually-hidden'>Cargando...</span>
                </div>
                <p className="mt-3">Cargando tus calificaciones...</p>
            </div>
        );
    }

    if (!idEstudiante) {
        return (
            <div className="estudiante-container p-4">
                <div className="alert alert-warning">
                    <h5><i className='bi bi-exclamation-triangle'></i> No se encontró información de estudiante</h5>
                    <p>Contacta al administrador para verificar tu perfil</p>
                </div>
            </div>
        );
    }
    return (
        <div className="estudiante-container p-4">
            <h2 className="mb-4">
                <i className="bi bi-journal-check"></i> Mis Calificaciones
            </h2>
            
            {/* Selector de Periodo */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card p-2 shadow-sm border-0">
                        <label className="text-muted small fw-bold mb-1 ml-2">FILTRAR POR PERIODO:</label>
                        <select 
                            className="form-select form-select-sm border-0 bg-light" 
                            value={periodoSel} 
                            onChange={(e) => cambiarPeriodo(e.target.value)}
                        >
                            <option value="">Todos los periodos</option>
                            {periodos.map(p => (
                                <option key={p.id_periodo} value={String(p.id_periodo)}>
                                    {p.nombre_periodo} - {p.anio_escolar}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-8 text-end">
                    <span className="badge bg-info text-white p-2">
                        <i className='bi bi-info-circle'></i> {resumen.length} materias encontradas
                    </span>
                </div>
            </div>
            
            <div className="row">
                {/* Tabla de Resumen */}
                <div className={detalle ? "col-md-7" : "col-md-12"}>
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">Resumen de Materias</div>
                        <div className="table-responsive">
                            <table className="table table-hover m-0">
                                <thead>
                                    <tr>
                                        <th>Materia</th>
                                        <th>Docente</th>
                                        <th>Nota Parcial</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumen.length > 0 ? resumen.map((m, index) => (
                                        <tr key={index}>
                                            <td>
                                                <strong>{m.nombre_materia}</strong>
                                                {m.descripcion && (
                                                    <small className="d-block text-muted"> 
                                                        {m.descripcion}
                                                    </small>
                                            )}
                                            </td>
                                            <td>{m.nombre_docente || 'Sin asignar'}</td>
                                            <td>
                                                <span className={`badge ${m.nota_parcial >= 3 ? 'bg-success' : 'bg-danger'}`}>
                                                    {m.nota_parcial !== undefined && m.nota_parcial !== null ? m.nota_parcial : 'Sin nota'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary" 
                                                    onClick={() => verDetalle(m.id_asignacion, m.nombre_materia)}
                                                    disabled={!m.id_asignacion}
                                                >
                                                    <i className='bi bi-eye'></i>Ver detalle
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center p-4 text-muted">
                                                <i className='bi bi-inbox display-4 d-block'></i>
                                                <p className='mt-2'>
                                                    {periodoSel ? 'No hay materias para este periodo' : 'No tienes materias asignadas aún'}
                                                </p>
                                                {periodoSel && (
                                                    <button className="btn btn-sm btn-secondary mt-2" onClick={() => cambiarPeriodo('')}>
                                                        Ver todos los periodos
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Vista de Detalle (Criterios) */}
                {detalle && (
                    <div className="col-md-5">
                        <div className="card shadow-sm border-primary">
                            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                                <span className="small">
                                    <i className='bi bi-book'></i> {detalle.nombre}</span>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setDetalle(null)}></button>
                            </div>
                            <div className="card-body p-0">
                                    {Array.isArray(detalle.datos) && detalle.datos.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                        {detalle.datos.map((c, i) => (
                                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong className="d-block">{c.criterio || 'Sin criterio'}</strong>
                                                    <small className="text-muted">
                                                        {c.porcentaje}% del total
                                                        {c.observaciones && (
                                                            <span className="d-block text-truncate" style={{maxWidth: '150px'}}>
                                                                {c.observaciones}
                                                            </span>
                                                        )}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className="fw-bold fs-5">
                                                        {c.nota_obtenida !== undefined && c.nota_obtenida !== null ? c.nota_obtenida : 'N/A'}
                                                    </span>
                                                    <small className='text-muted'>
                                                        {c.nota_ponderada !== undefined && c.nota_ponderada !== null ? ` (${c.nota_ponderada} pts)`: ''}
                                                    </small>
                                                </div>
                                            </li>
                                        ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-muted">
                                            <i className='bi bi-info-circle display-6'></i>
                                            <p className='mt-2'>
                                                {detalle.datos?.msg || "No hay criterios registrados aún."}
                                            </p>
                                            <small className='text-muted'>
                                                El docente aún no ha configurado los criterios de evaluación
                                            </small>
                                        </div>
                                    )}
                            </div>
                            <div className="card-footer bg-light">
                                <small className='text-muted'>
                                    <i className='bi bi-clock'></i> Última actualización: {new Date().toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisNotas;