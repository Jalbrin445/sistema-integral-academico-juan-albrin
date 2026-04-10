import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import './FormularioRegistro.css';

const FormularioRegistro = () => {
    const navigate = useNavigate();
    const { id_usuario } = useParams(); // Detecta si estamos editando
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

    // 1. cargar los grupos
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

    // 2. CARGAR DATOS DEL USUARIO SI ES EDICIÓN
    useEffect(() => {
        if (id_usuario) {
            const cargarDatosUsuario = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/usuarios/${id_usuario}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Mapeamos los datos que vienen del backend al estado del formulario
                    const datos = res.data;
                    
                    // Formatear fecha para el input type="date" (YYYY-MM-DD)
                    if (datos.fecha_nacimiento) {
                        datos.fecha_nacimiento = datos.fecha_nacimiento.split('T')[0];
                    }

                    setFormData ({
                        ...formData,
                        ...datos,
                        rol_id: (datos.rol_id_rol || datos.rol_id).toString() || '3', // Ajuste por nombre en DB
                        grupo_id: datos.grupo_id_grupo || datos.grupo_id || '',
                        contrasena: ''
                    });
                } catch (err) {
                    console.error("Error al obtener usuario:", err);
                    Swal.fire('Error', 'No se pudieron cargar los datos del usuario', 'error');
                }
            };
            cargarDatosUsuario();
        }
    }, [id_usuario]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const url = id_usuario 
                ? `http://localhost:5000/api/usuarios/actualizar/${id_usuario}` 
                : 'http://localhost:5000/api/usuarios/registro';
            
            const metodo = id_usuario ? 'put' : 'post';

            const res = await axios[metodo](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            Swal.fire({
                title: id_usuario ? '¡Actualización Exitosa!' : '¡Registro Exitoso!',
                text: res.data.msg,
                icon: 'success',
                confirmButtonText: 'Ir a la lista'
            }).then(() => {
                navigate('/MenuPrincipal/admin/usuarios');
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.msg || 'Error en la operación', 'error');
        }
    };

    return (
        <div className="formulario-registro-container">
            <div className="d-flex justify-content-start mb-3">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    ← Volver a Gestión
                </button>
            </div>

            <div className="card shadow border-0">
                <div className={`card-header ${id_usuario ? 'bg-warning' : 'bg-primary'} text-white py-3`}>
                    <h3 className="mb-0 fs-4">
                        {id_usuario ? `Editando Usuario: ${formData.nombre_usuario}` : 'Registrar Nuevo Integrante - SIA'}
                    </h3>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <h5 className="text-muted border-bottom pb-2 mb-3">Datos Personales</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Tipo Doc.</label>
                                <select className="form-select" name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange}>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Número Identificación</label>
                                <input type="text" className="form-control" name="numero_identificacion" value={formData.numero_identificacion} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Género</label>
                                <select className="form-select" name="genero" value={formData.genero} onChange={handleChange}>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Nombres</label>
                                <input type="text" className="form-control" name="nombres" value={formData.nombres} required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Apellido Paterno</label>
                                <input type="text" className="form-control" name="apellido_paterno" value={formData.apellido_paterno} required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Apellido Materno</label>
                                <input type="text" className="form-control" name="apellido_materno" value={formData.apellido_materno} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input type="date" className="form-control" name="fecha_nacimiento" value={formData.fecha_nacimiento} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Teléfono</label>
                                <input type="text" className="form-control" name="telefono" value={formData.telefono} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Dirección de Residencia</label>
                                <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ej: Calle 10 # 5-20" />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Dirección</label>
                                <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} />
                            </div>

                            <h5 className="text-muted border-bottom mt-4 pb-2 mb-3">Configuración de Cuenta</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Rol en el Sistema</label>
                                <select className="form-select" name="rol_id" value={formData.rol_id} onChange={handleChange} disabled={!!id_usuario}>
                                    <option value="1">Administrador</option>
                                    <option value="2">Docente</option>
                                    <option value="3">Estudiante</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input type="email" className="form-control" name="correo_electronico" value={formData.correo_electronico} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Nombre de Usuario</label>
                                <input type="text" className="form-control" name="nombre_usuario" value={formData.nombre_usuario} required onChange={handleChange} />
                            </div>

                            {!id_usuario && (
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input type="password" className="form-control" name="contrasena" required onChange={handleChange} />
                                </div>
                            )}

                            {/* CAMPOS DINÁMICOS */}
                            {formData.rol_id === '3' && (
                                <div className="row g-3 m-0 p-0">
                                    <h5 className="text-info border-bottom mt-4 pb-2 mb-3">Información Académica (Estudiante)</h5>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Código Estudiantil</label>
                                        <input type="text" className="form-control" name="codigo_estudiante" value={formData.codigo_estudiante || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Asignar Grupo</label>
                                        <select className="form-select" name="grupo_id" value={formData.grupo_id || ''} onChange={handleChange}>
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
                                        <input type="text" className="form-control" name="titulo_profesional" value={formData.titulo_profesional || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Especialidad</label>
                                        <input type="text" className="form-control" name="especialidad" value={formData.especialidad || ''} onChange={handleChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-5">
                            <button type="submit" className={`btn ${id_usuario ? 'btn-warning' : 'btn-success'} btn-lg w-100 shadow-sm`}>
                                {id_usuario ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioRegistro;