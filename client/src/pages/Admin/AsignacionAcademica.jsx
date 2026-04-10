import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AsignacionAcademica.css';

const AsignacionAcademica = () => {
    const [grupos, setGrupos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [cargaActual, setCargaActual] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        grupo_id_grupo: '',
        materia_id_materia: '',
        docente_id_docente: '',
        anio_escolar: new Date().getFullYear().toString()
    });

    useEffect(() => {
        cargarDatosBase();
    }, []);

    const cargarDatosBase = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [resGrupos, resMaterias, resDocentes] = await Promise.all([
                axios.get('http://localhost:5000/api/grupos', config),
                axios.get('http://localhost:5000/api/materias', config),
                axios.get('http://localhost:5000/api/docentes', config)
            ]);

            setGrupos(resGrupos.data);
            setMaterias(resMaterias.data);
            setDocentes(resDocentes.data);
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar los datos base', 'error');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAsignar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/asignaciones', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('¡Asignado!', res.data.msg, 'success');
            // Aquí podrías recargar la carga del grupo seleccionado
        } catch (error) {
            Swal.fire('Atención', error.response?.data?.msg || 'Error en asignación', 'warning');
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando Sistema de Asignación...</div>;

    return (
        <div className="asignacion-container p-4">
            <h2 className="mb-4"><i className="bi bi-person-workspace"></i> Asignación de Carga Académica</h2>

            <div className="row">
                {/* Panel de Asignación */}
                <div className="col-md-5">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0 text-center">Vincular Materia y Docente</h5>
                        </div>
                        <div className="card-body bg-light">
                            <form onSubmit={handleAsignar}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">1. Seleccione el Grupo</label>
                                    <select className="form-select" name="grupo_id_grupo" onChange={handleChange} required>
                                        <option value="">Seleccione grupo...</option>
                                        {grupos.map(g => (
                                            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grado} - {g.nombre_grupo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">2. Seleccione la Materia</label>
                                    <select className="form-select" name="materia_id_materia" onChange={handleChange} required>
                                        <option value="">Seleccione materia...</option>
                                        {materias.map(m => (
                                            <option key={m.id_materia} value={m.id_materia}>{m.nombre_materia}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">3. Seleccione al Docente</label>
                                    <select className="form-select" name="docente_id_docente" onChange={handleChange} required>
                                        <option value="">Seleccione docente...</option>
                                        {docentes.map(d => (
                                            <option key={d.id_docente} value={d.id_docente}>{d.nombres} {d.apellido_paterno}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Año Escolar</label>
                                    <input type="text" className="form-control" name="anio_escolar" value={formData.anio_escolar} readOnly />
                                </div>

                                <button type="submit" className="btn btn-success w-100 shadow-sm mt-2">
                                    <i className="bi bi-plus-circle"></i> Realizar Asignación
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Vista previa / Información informativa */}
                <div className="col-md-7">
                    <div className="alert alert-info border-0 shadow-sm">
                        <h5><i className="bi bi-info-circle-fill"></i> Instrucciones</h5>
                        <p>Para asignar la carga académica, asegúrese de que el grupo ya esté creado y el docente esté activo en el sistema. El sistema validará automáticamente que la materia no esté duplicada en el mismo grupo para el año actual.</p>
                    </div>
                    {/* Aquí podrías agregar una tabla que filtre por grupo para ver qué tiene asignado */}
                </div>
            </div>
        </div>
    );
};

export default AsignacionAcademica;