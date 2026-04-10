import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './GestionMaterias.css';

const GestionMaterias = () => {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo_materia: '',
        nombre_materia: '',
        descripcion: '',
        intensidad_horaria_semanal: ''
    });

    useEffect(() => {
        cargarMaterias();
    }, []);

    const cargarMaterias = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/materias', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterias(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar materias:", error);
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
            await axios.post('http://localhost:5000/api/materias', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('¡Registrada!', 'La materia se ha creado correctamente', 'success');
            setFormData({ codigo_materia: '', nombre_materia: '', descripcion: '', intensidad_horaria_semanal: '' });
            cargarMaterias();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.msg || 'Error al registrar', 'error');
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando materias...</div>;

    return (
        <div className="container-fluid gestion-materias p-4">
            <h2 className="mb-4 text-primary"><i className="bi bi-book-half"></i> Gestión de Materias</h2>
            
            <div className="row">
                
                <div className="col-md-4">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Registrar Materia</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Código (Ej: MAT-01)</label>
                                    <input type="text" className="form-control" name="codigo_materia" value={formData.codigo_materia} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre de la Materia</label>
                                    <input type="text" className="form-control" name="nombre_materia" value={formData.nombre_materia} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Intensidad Horaria (H/Semana)</label>
                                    <input type="number" className="form-control" name="intensidad_horaria_semanal" value={formData.intensidad_horaria_semanal} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-control" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Guardar Materia</button>
                            </form>
                        </div>
                    </div>
                </div>

                
                <div className="col-md-8">
                    <div className="card shadow border-0">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Código</th>
                                            <th>Materia</th>
                                            <th>H/S</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materias.map(m => (
                                            <tr key={m.id_materia}>
                                                <td><span className="badge bg-secondary">{m.codigo_materia}</span></td>
                                                <td><strong>{m.nombre_materia}</strong></td>
                                                <td>{m.intensidad_horaria_semanal}h</td>
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
        </div>
    );
};

export default GestionMaterias;