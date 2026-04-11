import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './MisNotas.css';

const MisNotas = () => {
    const { user } = useContext(AuthContext);
    const [resumen, setResumen] = useState([]);
    const [periodos, setPeriodos] = useState([]); // Nuevo: Estado para la lista de periodos
    const [periodoSel, setPeriodoSel] = useState(''); // Nuevo: Estado para el filtro
    const [detalle, setDetalle] = useState(null);
    const [cargando, setCargando] = useState(true);

    const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const idEst = user.id_estudiante || user.id;
                
                // Cargamos periodos y resumen inicial en paralelo para ganar velocidad
                const [resPer, resRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/periodos/activos', headers),
                    axios.get(`http://localhost:5000/api/notas/resumen/estudiante/${idEst}`, headers)
                ]);

                setPeriodos(resPer.data);
                setResumen(resRes.data);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            } finally {
                setCargando(false);
            }
        };

        if (user) cargarDatosIniciales();
    }, [user]);

    // Función para cambiar de periodo y filtrar las notas
    const cambiarPeriodo = async (idPeriodo) => {
        setPeriodoSel(idPeriodo);
        setCargando(true);
        try {
            const idEst = user.id_estudiante || user.id;
            // Si hay idPeriodo se filtra, si no, se trae el resumen general
            const url = idPeriodo 
                ? `http://localhost:5000/api/notas/resumen/estudiante/${idEst}?periodo=${idPeriodo}`
                : `http://localhost:5000/api/notas/resumen/estudiante/${idEst}`;
            
            const res = await axios.get(url, headers);
            setResumen(res.data);
            setDetalle(null); // Limpiamos el detalle lateral al cambiar de periodo
        } catch (error) {
            console.error("Error filtrando por periodo:", error);
        } finally {
            setCargando(false);
        }
    };

    const verDetalle = async (idAsignacion, nombreMateria) => {
        try {
            const idEst = user.id_estudiante || user.id;
            const res = await axios.get(`http://localhost:5000/api/notas/detalle/${idAsignacion}/${idEst}`, headers);
            setDetalle({ nombre: nombreMateria, datos: res.data });
        } catch (error) {
            console.error("Error cargando detalle:", error);
        }
    };

    if (cargando) return <div className="text-center p-5">Cargando tus calificaciones...</div>;

    return (
        <div className="estudiante-container p-4">
            <h2 className="mb-4"><i className="bi bi-journal-check"></i> Mis Calificaciones</h2>
            
            {/* Nuevo: Selector de Periodo */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card p-2 shadow-sm border-0">
                        <label className="text-muted small fw-bold mb-1 ml-2">FILTRAR POR PERIODO:</label>
                        <select 
                            className="form-select form-select-sm border-0 bg-light" 
                            value={periodoSel} 
                            onChange={(e) => cambiarPeriodo(e.target.value)}
                        >
                            <option value="">Periodo Actual / Todos</option>
                            {periodos.map(p => (
                                <option key={p.id_periodo} value={p.id_periodo}>
                                    {p.nombre_periodo}
                                </option>
                            ))}
                        </select>
                    </div>
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
                                            <td>{m.nombre_materia}</td>
                                            <td>{m.nombre_docente}</td>
                                            <td>
                                                <span className={`badge ${m.nota_parcial >= 3 ? 'bg-success' : 'bg-danger'}`}>
                                                    {m.nota_parcial}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary" 
                                                    onClick={() => verDetalle(m.id_asignacion, m.nombre_materia)}
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center p-4 text-muted">
                                                No se encontraron materias para este periodo.
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
                                <span className="small">DETALLE: {detalle.nombre}</span>
                                <button className="btn-close btn-close-white" onClick={() => setDetalle(null)}></button>
                            </div>
                            <div className="card-body p-0">
                                <ul className="list-group list-group-flush">
                                    {Array.isArray(detalle.datos) && detalle.datos.length > 0 ? (
                                        detalle.datos.map((c, i) => (
                                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong className="d-block">{c.criterio}</strong>
                                                    <small className="text-muted">{c.porcentaje}% del total</small>
                                                </div>
                                                <span className="fw-bold fs-5">{c.nota_obtenida}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted">
                                            {detalle.datos?.msg || "No hay criterios registrados aún."}
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisNotas;