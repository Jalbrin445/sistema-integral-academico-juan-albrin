import React, { useState, useEffect, useContext } from 'react';
import siaApi from '../../api/siaApi';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';

const RegistrarNotas = () => {
    const { user, loading } = useContext(AuthContext);
    const [asignaciones, setAsignaciones] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [criterios, setCriterios] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);

    const [idAsignacion, setIdAsignacion] = useState('');
    const [idPeriodo, setIdPeriodo] = useState('');
    const [idCriterio, setIdCriterio] = useState('');

    const [notas, setNotas] = useState({});
    const [calificacionesExistentes, setCalificacionesExistentes] = useState({});
    const [cargando, setCargando] = useState(false)
    useEffect(() => {
            const cargarInicial = async () => {
                if (loading || !user?.id) {
                    setCargando(false);
                    return;
                }
                    

                try {
                    const docenteId = user.id_docente || user.id;
                    const [resAsig, resPer] = await Promise.all([
                        siaApi.get(`/asignaciones/docente/${docenteId}`),
                        siaApi.get('/periodos/activos')
                    ]);
                    setAsignaciones(resAsig.data);
                    setPeriodos(resPer.data);
                } catch (error) {
                    console.error("Error en RegistrarNotas:", error);
                    if (error.response?.status === 404) {
                        Swal.fire('Error', 'No se encontraron asignaciones para este docente', 'warning');
                    }
                } finally {
                    setCargando(false);
                }  
            };
            cargarInicial();
        }, [user, loading]);

    const handleAsignacionChange = async (e) => {
        const value = e.target.value;
        setIdAsignacion(value);

        setIdCriterio('');
        setIdPeriodo('');
        setCriterios([]);
        setEstudiantes([]);
        setNotas({});
        setCalificacionesExistentes({});

        if (!value) return;

        setCargando(true);
        try {

            const asig = asignaciones.find(a => String(a.id_asignacion) === String(value));
            const grupoId = asig?.grupo_id_grupo || asig?.id_grupo;

            if (!grupoId) {
                Swal.fire('Error', 'No se encontró el grupo para esta asignación', 'warning');
                setCargando(false);
                return;
            }
            
            const [resCrit, resEst] = await Promise.all([
                siaApi.get(`/notas/criterios/${value}`),
                siaApi.get(`/estudiantes/grupo/${grupoId}`)]);
            
            setCriterios(resCrit.data);
            setEstudiantes(resEst.data);
        } catch (error) {
            console.error("Error al cargar datos de la materia:", error);
            Swal.fire('Error', 'Error al cargar los datos', 'error');
            setEstudiantes([]);
        } finally {
            setCargando(false);
        }
    };

    const handleCriterioChange = async (e) => {
        const value = e.target.value;
        setIdCriterio(value);
        if (!value || !idAsignacion) {
            setNotas({});
            setCalificacionesExistentes({});
            return;
        }

        setCargando(true);

        try {
            const res = await siaApi.get(`/notas/buscar/${value}/${idAsignacion}`);
            
            const mapaNotas = {};
            const mapaCalificIds = {};

            res.data.forEach(c => {
                mapaNotas[c.estudiante_id_estudiante] = c.nota;
                mapaCalificIds[c.estudiante_id_estudiante] = c.id_calificacion;
            });

            setNotas(mapaNotas);
            setCalificacionesExistentes(mapaCalificIds);
        } catch (error) {
            console.error("Error al cargar notas: ", error);
            setNotas({});
            setCalificacionesExistentes({});
        } finally {
            setCargando(false);
        }
    };
    const guardarTodo = async () => {

        if (!idPeriodo) {
            Swal.fire('Error', 'Debes seleccionar un período', 'warning');
            return;
        }
        if (!idCriterio) {
            Swal.fire('Error', 'Debes seleccionar un criterio', 'warning');
            return;
        }
        if (estudiantes.length === 0) {
            Swal.fire('Error', 'No hay estudiantes para calificar', 'warning');
            return;
        }        
        
        const notasFaltantes = estudiantes.filter(est => {
            const nota = notas[est.id_estudiante];
            return nota === undefined || nota === '' || nota === null;
        });

        if (notasFaltantes.length > 0) {
            const confirmar = await Swal.fire({
                title: 'Notas incompletas',
                text: `Faltan notas para ${notasFaltantes.length} estudiante (s). ¿Deseas continuar?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            });
            if (!confirmar.isConfirmed) return;
        }
        try {
            Swal.fire({ 
                title: 'Procesando...', 
                allowOutsideClick: false, 
                didOpen: () => Swal.showLoading() 
            });

            const promesas = estudiantes.map(est => {
                const idEst = est.id_estudiante;
                const notaActual = notas[idEst];

                if (notaActual === undefined || notaActual === '') return null;

                const notaNum = parseFloat(notaActual);

                if (isNaN(notaNum) || notaNum < 0 || notaNum > 5) {
                    throw new Error(`Nota inválida para ${est.nombres} ${est.apellido_paterno}`);
                }
                const data ={
                    nota: notaNum,
                    observaciones: "Nota de periodo",
                    criterio_id: parseInt(idCriterio),
                    estudiante_id: parseInt(idEst),
                    asignacion_id: parseInt(idAsignacion),
                    docente_id: parseInt(user.id_docente || user.id),
                    periodo_id: parseInt(idPeriodo)
                };

                const idCalificacionPrevia = calificacionesExistentes[idEst];

                if (idCalificacionPrevia) {
                    return siaApi.put(`/notas/actualizar/${idCalificacionPrevia}`, data);
                } else {
                    siaApi.post('/notas/registrar', data)
                }

            }).filter(p => p !== null);


            if (promesas.length === 0) {
                Swal.fire('Error', 'No hay notas para guardar', 'warning');
                return;
            }
            await Promise.all(promesas);

            await handleCriterioChange({ target: { value: idCriterio}});
            
            Swal.fire('Éxito', 'Notas registradas', 'success');
        } catch (e) { 
            console.error('Error al guardar notas:', error);
            Swal.fire('Error',  e.message || 'Hubo un fallo', 'error'); 
        }
    };
    if (cargando) {
        return <div className="text-center p-5">Cargando datos...</div>;
    }

    if (asignaciones.length === 0) {
        return (
            <div className="docente-seccion p-4 bg-white rounded shadow-sm">
                <h3><i className="bi bi-pencil-square"></i>Planilla de Notas</h3>
                
                <div className="alert alert-warning mt-3">
                    No tienes materias asignadas. Contacta al administrador
                </div>
            </div>
        );
    }
    return (
                <div className="docente-seccion p-4 bg-white rounded shadow-sm">
            <h3><i className="bi bi-pencil-square"></i> Planilla de Notas</h3>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label fw-bold">Materia:</label>
                    <select 
                        className="form-select" 
                        onChange={handleAsignacionChange}
                        value={idAsignacion}
                    >
                        <option value="">Seleccione...</option>
                        {asignaciones.map(a => (
                            <option key={a.id_asignacion} value={a.id_asignacion}>
                                {a.nombre_materia} - {a.nombre_grupo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label fw-bold">Periodo:</label>
                    <select 
                        className="form-select" 
                        onChange={e => setIdPeriodo(e.target.value)}
                        value={idPeriodo}
                    >
                        <option value="">Seleccione...</option>
                        {periodos.map(p => (
                            <option key={p.id_periodo} value={p.id_periodo}>
                                {p.nombre_periodo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label fw-bold">Criterio:</label>
                    <select 
                        className="form-select" 
                        onChange={handleCriterioChange}
                        value={idCriterio}
                        disabled={!idAsignacion || criterios.length === 0}
                    >
                        <option value="">{criterios.length === 0 ? 'No hay criterios configurados' : 'Seleccione...'}</option>
                        {criterios.map(c => (
                            <option key={c.id_criterio} value={c.id_criterio}>
                                {c.nombre_criterio} ({c.porcentaje}%)
                            </option>
                        ))}
                    </select>
                    {idAsignacion && criterios.length === 0 && (
                        <small className="text-warning d-block mt-1">
                            No hay criterios configurados para esta materia. 
                            Ve a "Configurar Criterios" para agregar uno.
                        </small>
                    )}
                </div>
            </div>

            {estudiantes.length > 0 && idCriterio && (
                <div className="contenedor-planilla">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Nota (0-5)</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map(est => (
                                    <tr key={est.id_estudiante}>
                                        <td>
                                            <strong>{est.apellido_paterno}</strong> {est.nombres}
                                        </td>
                                        <td>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                min="0" 
                                                max="5"
                                                className="form-control" 
                                                style={{ width: '100px' }}
                                                value={notas[est.id_estudiante] !== undefined ? notas[est.id_estudiante] : ''}
                                                onChange={e => setNotas({
                                                    ...notas, 
                                                    [est.id_estudiante]: e.target.value
                                                })}
                                            />
                                        </td>
                                        <td>
                                            {calificacionesExistentes[est.id_estudiante] 
                                                ? <span className="badge bg-warning text-dark">Registrada</span> 
                                                : <span className="badge bg-light text-muted">Pendiente</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button 
                        className="btn btn-success mt-3 w-100"
                        onClick={guardarTodo}
                        disabled={!idPeriodo || !idCriterio || estudiantes.length === 0}
                    >
                        <i className="bi bi-save"></i> {Object.keys(calificacionesExistentes).length > 0 ? 'Actualizar Calificaciones' : 'Guardar Calificaciones'}
                    </button>
                </div>
            )}

            {estudiantes.length > 0 && !idCriterio && (
                <div className="alert alert-info mt-3">
                    {criterios.length === 0 
                        ? 'No hay criterios configurados para esta materia. Ve a "Configurar Criterios" para agregar uno.' 
                        : 'Selecciona un criterio para comenzar a calificar.'}
                </div>
            )}

            {estudiantes.length === 0 && idAsignacion && (
                <div className="alert alert-warning mt-3">
                    No hay estudiantes en este grupo.
                </div>
            )}
        </div>
    );
};
export default RegistrarNotas;