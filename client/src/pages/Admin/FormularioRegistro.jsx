import React, { useState, useEffect } from 'react';
import siaApi from '../../api/siaApi';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import './FormularioRegistro.css';

const FormularioRegistro = () => {
    const navigate = useNavigate();
    const { id_usuario } = useParams(); // Detecta si estamos editando
    const [grupos, setGrupos] = useState([]);
    const [errorFecha, setErrorFecha] = useState('');
    const [errorGeneral, setErrorGeneral] = useState('');
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
        grupo_id_grupo: '',
        especialidad: '',
        titulo_profesional: ''
    });

    // 1. cargar los grupos
    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const res = await siaApi.get('/grupos')
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
                    
                    const res = await siaApi.get(`/usuarios/${id_usuario}`)
                    
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
                        grupo_id_grupo: datos.grupo_id_grupo || datos.grupo_id || '',
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrorGeneral('');

        if (name === 'fecha_nacimiento') {
            if (!value) {
                setErrorFecha('');
                return;
            }

            const fecha = new Date(value);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fecha.getFullYear();
            const fechaValida = !Number.isNaN(fecha.getTime()) && edad >= 5 && edad <= 100;
            setErrorFecha(fechaValida ? '' : 'La fecha ingresada no es correcta');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fecha = formData.fecha_nacimiento;
        if (fecha) {
            const dateValue = new Date(fecha);
            const hoy = new Date();
            const edad = hoy.getFullYear() - dateValue.getFullYear();
            const fechaValida = !Number.isNaN(dateValue.getTime()) && edad >= 5 && edad <= 100;

            if (!fechaValida) {
                setErrorFecha('La fecha ingresada no es correcta');
                return;
            }
        }

        setErrorFecha('');
        setErrorGeneral('');

        try {
            const url = id_usuario 
                ? `/usuarios/actualizar/${id_usuario}` 
                : '/usuarios/registro';
            
            const metodo = id_usuario ? 'put' : 'post';

            const res = await siaApi[metodo](url, formData);
            
            Swal.fire({
                title: id_usuario ? '¡Actualización Exitosa!' : '¡Registro Exitoso!',
                text: res.data.msg,
                icon: 'success',
                confirmButtonText: 'Ir a la lista'
            }).then(() => {
                navigate('/MenuPrincipal/admin/usuarios');
            });
        } catch (err) {
            const mensajeValidacion = err.response?.data?.errors?.find(error => error.campo === 'fecha_nacimiento')?.mensaje
                || err.response?.data?.msg
                || 'Error en la operación';

            setErrorGeneral(mensajeValidacion);
            Swal.fire('Error', mensajeValidacion, 'error');
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
                        {errorGeneral && (
                            <div className="alert alert-danger mb-4" role="alert">
                                {errorGeneral}
                            </div>
                        )}
                        <div className="row">
                            <h5 className="text-muted border-bottom pb-2 mb-3">Datos Personales</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label for="tipo_identificacion" className="form-label">Tipo Doc.</label>
                                <select id="tipo_identificacion" className="form-select" name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange}>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="numero_identificacion" className="form-label">Número Identificación</label>
                                <input id="numero_identificacion" type="text" className="form-control" name="numero_identificacion" value={formData.numero_identificacion} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="genero" className="form-label">Género</label>
                                <select id="genero" className="form-select" name="genero" value={formData.genero} onChange={handleChange}>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="nombres" className="form-label">Nombre(s)</label>
                                <input id="nombres" type="text" className="form-control" name="nombres" value={formData.nombres} required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label for="apellido_paterno" className="form-label">Apellido Paterno</label>
                                <input id="apellido_paterno" type="text" className="form-control" name="apellido_paterno" value={formData.apellido_paterno} required onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label for="apellido_materno" className="form-label">Apellido Materno</label>
                                <input id="apellido_materno" type="text" className="form-control" name="apellido_materno" value={formData.apellido_materno} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                                <input
                                    id="fecha_nacimiento"
                                    type="date"
                                    className={`form-control ${errorFecha ? 'is-invalid' : ''}`}
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    required
                                    onChange={handleChange}
                                />
                                {errorFecha && (
                                    <div className="invalid-feedback d-block mt-2 fw-semibold" style={{ color: '#dc3545' }}>
                                        {errorFecha}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="telefono" className="form-label">Teléfono</label>
                                <input id="telefono" type="text" className="form-control" name="telefono" value={formData.telefono} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="direccion" className="form-label">Dirección de Residencia</label>
                                <input id="direccion" type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ej: Calle 10 # 5-20" />
                            </div>

                            <h5 className="text-muted border-bottom mt-4 pb-2 mb-3">Configuración de Cuenta</h5>
                            
                            <div className="col-md-4 mb-3">
                                <label for="rol_id" className="form-label">Rol en el Sistema</label>
                                <select id="rol_id" className="form-select" name="rol_id" value={formData.rol_id} onChange={handleChange} disabled={!!id_usuario}>
                                    <option value="1">Administrador</option>
                                    <option value="2">Docente</option>
                                    <option value="3">Estudiante</option>
                                </select>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="correo_electronico" className="form-label">Correo Electrónico</label>
                                <input id="correo_electronico" type="email" className="form-control" name="correo_electronico" value={formData.correo_electronico} required onChange={handleChange} />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label for="nombre_usuario" className="form-label">Nombre de Usuario</label>
                                <input id="nombre_usuario" type="text" className="form-control" name="nombre_usuario" value={formData.nombre_usuario} required onChange={handleChange} />
                            </div>

                            {!id_usuario && (
                                <div className="col-md-4 mb-3">
                                    <label for="contrasena" className="form-label">Contraseña</label>
                                    <input id="contrasena" type="password" className="form-control" name="contrasena" required onChange={handleChange} />
                                </div>
                            )}

                            {/* CAMPOS DINÁMICOS */}
                            {formData.rol_id === '3' && (
                                <div className="row g-3 m-0 p-0">
                                    <h5 className="text-info border-bottom mt-4 pb-2 mb-3">Información Académica (Estudiante)</h5>
                                    <div className="col-md-6 mb-3">
                                        <label for="codigo_estudiante" className="form-label">Código Estudiantil</label>
                                        <input id="codigo_estudiante" type="text" className="form-control" name="codigo_estudiante" value={formData.codigo_estudiante || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label for="grupo_id_grupo" className="form-label">Asignar Grupo</label>
                                        <select id="grupo_id_grupo" className="form-select" name="grupo_id_grupo" value={formData.grupo_id_grupo || ''} onChange={handleChange}>
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
                                        <label for="titulo_profesional" className="form-label">Título Profesional</label>
                                        <input id="titulo_profesional" type="text" className="form-control" name="titulo_profesional" value={formData.titulo_profesional || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label for="especialidad" className="form-label">Especialidad</label>
                                        <input id="especialidad" type="text" className="form-control" name="especialidad" value={formData.especialidad || ''} onChange={handleChange} />
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