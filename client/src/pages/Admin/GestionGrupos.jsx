import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './GestionGrupos.css'; // Asegúrate de crear este CSS

const GestionGrupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [grados, setGrados] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        nombre_grupo: '',
        anio_escolar: new Date().getFullYear().toString(),
        capacidad_maxima: 30,
        grado_id_grado: '',
        docente_id_docente: ''
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Ejecutamos las peticiones en paralelo para ganar velocidad
            const [resGrupos, resGrados, resDocentes] = await Promise.all([
                axios.get('http://localhost:5000/api/grupos', config),
                axios.get('http://localhost:5000/api/grados', config), // Asegúrate de tener esta ruta
                axios.get('http://localhost:5000/api/docentes', config)
            ]);

            setGrupos(resGrupos.data);
            setGrados(resGrados.data);
            setDocentes(resDocentes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error cargando datos:", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/grupos', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('¡Éxito!', 'El grupo ha sido configurado correctamente', 'success');
            setFormData({ ...formData, nombre_grupo: '' }); // Limpiar campo
            cargarDatosIniciales(); // Refrescar tabla
        } catch (error) {
            Swal.fire('Error', error.response?.data?.msg || 'No se pudo crear el grupo', 'error');
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando configuración de grupos...</div>;

    return (
        <div className="gestion-grupos-container p-4">
            <h2 className="mb-4"><i className="bi bi-grid-3x3-gap-fill"></i> Configuración de Grupos Académicos</h2>

            <div className="row">
                {/* FORMULARIO DE CREACIÓN */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Nuevo Grupo</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre del Grupo (Ej: 10-A)</label>
                                    <input type="text" className="form-control" name="nombre_grupo" value={formData.nombre_grupo} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Año Escolar</label>
                                    <input type="text" className="form-control" name="anio_escolar" value={formData.anio_escolar} onChange={handleChange} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Capacidad Máxima</label>
                                    <input type="number" className="form-control" name="capacidad_maxima" value={formData.capacidad_maxima} onChange={handleChange} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Asignar Grado</label>
                                    <select className="form-select" name="grado_id_grado" value={formData.grado_id_grado} onChange={handleChange} required>
                                        <option value="">Seleccione grado...</option>
                                        {grados.map(gr => (
                                            <option key={gr.id_grado} value={gr.id_grado}>{gr.nombre_grado}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Director de Grupo (Docente)</label>
                                    <select className="form-select" name="docente_id_docente" value={formData.docente_id_docente} onChange={handleChange}>
                                        <option value="">Sin asignar director...</option>
                                        {docentes.map(d => (
                                            <option key={d.id_docente} value={d.id_docente}>{d.nombres} {d.apellido_paterno}</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">Crear Grupo</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* LISTADO DE GRUPOS EXISTENTES */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Grado</th>
                                        <th>Grupo</th>
                                        <th>Año</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupos.map(g => (
                                        <tr key={g.id_grupo}>
                                            <td>{g.nombre_grado}</td>
                                            <td><strong>{g.nombre_grupo}</strong></td>
                                            <td>{g.anio_escolar}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionGrupos;