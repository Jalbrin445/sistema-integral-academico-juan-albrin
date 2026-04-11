import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';

const RegistrarNotas = () => {
    const { user, loading } = useContext(AuthContext);
    const [asignaciones, setAsignaciones] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [criterios, setCriterios] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [form, setForm] = useState({ id_asignacion: '', id_periodo: '', id_criterio: '' });
    const [notas, setNotas] = useState({});

    const [calificacionesExistentes, setCalificacionesExistentes] = useState({});
    const token = localStorage.getItem('token');
    const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => {
            const cargarInicial = async () => {
                if (loading || !user?.id) return; 

                try {
                    const [resAsig, resPer] = await Promise.all([
                        axios.get(`http://localhost:5000/api/asignaciones/docente/${user.id}`, headers),
                        axios.get('http://localhost:5000/api/periodos/activos', headers)
                    ]);
                    setAsignaciones(resAsig.data);
                    setPeriodos(resPer.data);
                } catch (error) {
                    console.error("Error en RegistrarNotas:", error);
                }   
            };
            cargarInicial();
        }, [user, loading]);

    const handleAsignacionChange = async (idAsig) => {
        if (!idAsig) return;
        setForm({...form, id_asignacion: idAsig});
        try {

            const asig = asignaciones.find(a => String(a.id_asignacion) === String(idAsig));
            const grupoId = asig?.grupo_id_grupo || asig?.id_grupo;

            
            const [resCrit, resEst] = await Promise.all([
                axios.get(`http://localhost:5000/api/notas/criterios/${idAsig}`, headers),
                axios.get(`http://localhost:5000/api/estudiantes/grupo/${grupoId}`, headers)])
            
            setCriterios(resCrit.data);
            setEstudiantes(resEst.data);
        } catch (error) {
            console.error("Error al cargar datos de la materia:", error);
            setEstudiantes([]);
        }
    };

    const handleCriterioChange = async (idCrit) => {
        setForm({ ...form, id_criterio: idCrit});
        if (!idCrit || !form.id_asignacion) return;

        try {
            const res = await axios.get(`http://localhost:5000/api/notas/buscar/${idCrit}/${form.id_asignacion}`, headers);
            
            const mapaNotas = {};
            const mapaCalificIds = {};

            res.data.forEach(c => {
                mapaNotas[c.estudiante_id_estudiante] = c.nota;
                mapaCalificIds[c.estudiante_id_estudiante] = c.id_calificacion;
            });

            setNotas(mapaNotas);
            setCalificacionesExistentes(mapaCalificIds);
        } catch (error) {
            setNotas({});
            setCalificacionesExistentes({});
        }
    }
    const guardarTodo = async () => {

        if(!form.id_periodo || !form.id_criterio) return Swal.fire('Error', 'Faltan datos (Periodo o Criterio)', 'error');
        
        const tokenFresco = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${tokenFresco}`}};
        try {
            Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            const promesas = estudiantes.map(est => {
                const idEst = est.id_estudiante;
                const notaActual = notas[idEst];

                if (notaActual === undefined || notaActual === '') return null;

                const data ={
                    nota: notaActual,
                    observaciones: "Nota de periodo",
                    criterio_id: form.id_criterio,
                    estudiante_id: idEst,
                    asignacion_id: form.id_asignacion,
                    docente_id: user.id_docente,
                    periodo_id: form.id_periodo
                };

                const idCalificacionPrevia = calificacionesExistentes[idEst];

                if (idCalificacionPrevia) {
                    return axios.put(`http://localhost:5000/api/notas/actualizar/${idCalificacionPrevia}`, data, config);
                } else {
                    axios.post('http://localhost:5000/api/notas/registrar', data, config)
                }

            }).filter(p => p !== null);

            await Promise.all(promesas);

            await handleCriterioChange(form.id_criterio);
            
            Swal.fire('Éxito', 'Notas registradas', 'success');
        } catch (e) { Swal.fire('Error', 'Hubo un fallo', 'error'); }
    };

    return (
        <div className="docente-seccion p-4 bg-white rounded shadow-sm">
            <h3><i className="bi bi-pencil-square"></i> Planilla de Notas</h3>
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="label-informativo">Materia:</label>
                    <select className="form-select" onChange={e => handleAsignacionChange(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {asignaciones.map(a => <option key={a.id_asignacion} value={a.id_asignacion}>{a.nombre_materia} - {a.nombre_grupo}</option>)}
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="label-informativo">Periodo:</label>
                    <select className="form-select" onChange={e => setForm({...form, id_periodo: e.target.value})}>
                        <option value="">Seleccione...</option>
                        {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre_periodo}</option>)}
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="label-informativo">Criterio:</label>
                    <select className="form-select" onChange={e => handleCriterioChange(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {criterios.map(c => <option key={c.id_criterio} value={c.id_criterio}>{c.nombre_criterio} ({c.porcentaje}%)</option>)}
                    </select>
                </div>
            </div>

            {estudiantes.length > 0 && (
                <div className="contenedor-planilla">
                    <table className="table tabla-notas">
                        <thead><tr><th>Estudiante</th><th>Nota</th></tr></thead>
                        <tbody>
                            {estudiantes.map(est => (
                                <tr key={est.id_estudiante}>
                                    <td>{est.apellido_paterno} {est.nombres}</td>
                                    <td><input type="number" step="0.1" className="input-nota-docente" value={ notas[est.id_estudiante] || ''}onChange={e => setNotas({...notas, [est.id_estudiante]: e.target.value})} /></td>
                                    <td>
                                        {calificacionesExistentes[est.id_estudiante] 
                                            ? <span className="badge bg-warning text-dark">Registrada</span> 
                                            : <span className="badge bg-light text-muted">Pendiente</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-docente-principal m-3" onClick={guardarTodo}>{Object.keys(calificacionesExistentes).length > 0 ? 'Actualizar Calificaciones' : 'Guardar Calificaciones'}</button>
                </div>
            )}
        </div>
    );
};
export default RegistrarNotas;