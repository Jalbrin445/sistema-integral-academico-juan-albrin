import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './FormularioRegistro.css'; // Asegúrate de crear este CSS con lo que te pasé

const FormularioRegistro = () => {
    const navigate = useNavigate();
    const [grupos, setGrupos] = useState([]);
    const [formData, setFormData] = useState({
        tipo_identificacion: 'CC',
        numero_identificacion: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        genero: 'M',
        telefono: '',
        correo_electronico: '',
        direccion: '',
        nombre_usuario: '',
        contrasena: '',
        rol_id: '3', 
        codigo_estudiante: '',
        grupo_id: '',
        especialidad: '',
        titulo_profesional: ''
    });

    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/grupos', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGrupos(res.data);
            } catch (err) {
                console.error("Error al cargar grupos");
            }
        };
        cargarGrupos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/usuarios/registro', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            Swal.fire({
                title: '¡Registro Exitoso!',
                text: res.data.msg,
                icon: 'success',
                confirmButtonText: 'Ir a la lista'
            }).then(() => {
                navigate('/MenuPrincipal/admin/usuarios'); // Redirige automáticamente al terminar
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.msg || 'Error al registrar', 'error');
        }
    };

    return (
        <div className="formulario-registro-container">
            {/* BOTÓN PARA REGRESAR */}
            <div className="d-flex justify-content-start mb-3">
                <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => navigate(-1)}
                >
                    ← Volver a Gestión
                </button>
            </div>

            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white py-3">
                    <h3 className="mb-0 fs-4">Registrar Nuevo Integrante - SIA</h3>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <h5 className="text-muted border-bottom pb-2 mb-3">Datos Personales</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Tipo Doc.</label>
                                <select className="form-select" name="tipo_identificacion" onChange={handleChange}>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Número Identificación</label>
                                <input type="text" className="form-control" name="numero_identificacion" required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Nombres</label>
                                <input type="text" className="form-control" name="nombres" required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Apellido Paterno</label>
                                <input type="text" className="form-control" name="apellido_paterno" required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Apellido Materno</label>
                                <input type="text" className="form-control" name="apellido_materno" required onChange={handleChange} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input 
                                        type="date" 
                                        className="form-control" 
                                        name="fecha_nacimiento" 
                                        required // Hazlo obligatorio para evitar el error
                                        onChange={handleChange} 
                                    />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Teléfono</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="telefono" 
                                    placeholder="Ej: 3101234567"
                                    required // <--- Esto evita que el valor sea enviado vacío
                                    onChange={handleChange} 
                                />
                            </div>

                            <h5 className="text-muted border-bottom mt-4 pb-2 mb-3">Configuración de Cuenta</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Rol en el Sistema</label>
                                <select className="form-select" name="rol_id" value={formData.rol_id} onChange={handleChange}>
                                    <option value="1">Administrador</option>
                                    <option value="2">Docente</option>
                                    <option value="3">Estudiante</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        name="correo_electronico" 
                                        required // <--- Esto obliga al Admin a pedir el correo
                                        onChange={handleChange} 
                                    />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Nombre de Usuario</label>
                                <input type="text" className="form-control" name="nombre_usuario" required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Contraseña</label>
                                <input type="password" className="form-control" name="contrasena" required onChange={handleChange} />
                            </div>

                            {/* CAMPOS DINÁMICOS */}
                            {formData.rol_id === '3' && (
                                <div className="row g-3 m-0 p-0">
                                    <h5 className="text-info border-bottom mt-4 pb-2 mb-3">Información Académica (Estudiante)</h5>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Código Estudiantil</label>
                                        <input type="text" className="form-control" name="codigo_estudiante" onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Asignar Grupo</label>
                                        <select className="form-select" name="grupo_id" onChange={handleChange}>
                                            <option value="">Seleccione un grupo...</option>
                                            {grupos.map(g => (
                                                <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo} - {g.nombre_grado}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.rol_id === '2' && (
                                <div className="row g-3 m-0 p-0">
                                    <h5 className="text-info border-bottom mt-4 pb-2 mb-3">Información Profesional (Docente)</h5>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Título Profesional</label>
                                        <input type="text" className="form-control" name="titulo_profesional" onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Especialidad</label>
                                        <input type="text" className="form-control" name="especialidad" onChange={handleChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-5">
                            <button type="submit" className="btn btn-success btn-lg w-100 shadow-sm">
                                Guardar Registro en SIA
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioRegistro;