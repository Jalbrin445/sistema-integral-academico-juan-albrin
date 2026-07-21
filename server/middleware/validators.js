const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            msg: 'Error de validación',
            errors: errors.array().map(err => ({
                campo: err.path,
                mensaje: err.msg
            }))
        });
    }
    next();
}

const validateUserRegistration = [
    body('numero_identificacion')
        .notEmpty().withMessage('La identificacion es requerida')
        .isLength({min: 5, max: 20}).withMessage('El número de identificación debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9]+$/).withMessage('El número de identificación solo debe contener números'),

    body('nombres')
        .notEmpty().withMessage('Los nombres son requeridos')
        .isLength({ min: 2, max: 100}).withMessage('Nombres debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombres solo debe contener letras'),
    
    body('apellido_paterno')
        .notEmpty().withMessage('El apellido paterno es requerido')
        .isLength({ min: 2, max: 50}).withMessage('Apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Apellido solo debe contener letras'),
    
    body('apellido_materno')
        .notEmpty().withMessage('El apellido materno es requerido')
        .isLength({ min: 2, max: 50}).withMessage('Apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Apellido solo debe contener letras'),
    
    body('correo_electronico')
        .notEmpty().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('Formato de correo electrónico inválido')
        .normalizeEmail(),
    
    body('nombre_usuario')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isLength({ min: 3, max: 50}).withMessage('Usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Usuario solo debe contener letras, números y guión bajo'),
    
    body('contrasena')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Contraseña debe tener al menos una mayúscula, una minúscula y un número'),
    
    body('rol_id')
        .notEmpty().withMessage('El rol es requerido')
        .isIn(['1', '2', '3']).withMessage('Rol inválido'),
    
    body('fecha_nacimiento')
        .optional()
        .isDate().withMessage('Fecha de nacimiento inválida')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 5 || age > 100) {
                throw new Error('Edad debe estar entre 5 y 100 años');
            }
            return true;
        }),
    
    body('telefono')
        .optional({ checkFalsy: true})
        .matches(/^[0-9]{7,15}$/).withMessage('Teléfono debe tener entre 7 y 15 dígitos'),
    
    // Validaciones específicas para estudiantes
    body('codigo_estudiante')
        .optional({checkFalsy: true})
        .isLength({ min: 3, max: 20 }).withMessage('Código de estudiante debe tener entre 3 y 20 caracteres'),
    
    body('grupo_id')
        .optional({ checkFalsy: true})
        .isNumeric().withMessage('ID de grupo inválido'),
    
    // Validaciones específicas para docentes
    body('especialidad')
        .if(body('rol_id').equals('2'))
        .optional({checkFalsy: true})
        .isLength({ max: 100 }).withMessage('Especialidad no puede exceder 100 caracteres'),
    
    body('titulo_profesional')
        .if(body('rol_id').equals('2'))
        .optional({checkFalsy: true})
        .isLength({ max: 100 }).withMessage('Título profesional no puede exceder 100 caracteres'),
];

const validateUserUpdate =[
    body('numero_identificacion')
        .notEmpty().withMessage('La identificación es requerida')
        .isLength({ min:5, max:20}).withMessage('El número de identificación debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9]+$/).withMessage('El número de identificación solo debe contener números'),

    body('nombres')
        .notEmpty().withMessage('Los nombres son requeridos')
        .isLength({ min:2, max:100}).withMessage('Nombres debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombres solo debe contener letras'),
    body('apellido_paterno')
        .optional({ checkFalsy: true})
        .isLength({ min:2, max:50}).withMessage('Apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Apellido solo debe contener letras'),

    body('apellido_materno')
        .optional({checkFalsy: true})
        .isLength({ min:2, max:50}).withMessage('Apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Apellido solo debe contener letras'),

    body('correo_electronico')
        .notEmpty().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('Formato de correo electrónico inválido')
        .normalizeEmail(),
    
    body('nombre_usuario')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isLength({ min: 3, max: 50}).withMessage('Usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Usuario solo debe contener letras números y guión bajo'),
    
    body('contrasena')
        .optional({checkFalsy: true})
        .isLength({ min: 6}).withMessage('Contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Contraseña debe tener al menos una mayúscula, una minúscula y un número'),

    body('rol_id')
        .notEmpty().withMessage('El rol es requerido')
        .isIn(['1', '2', '3']).withMessage('Rol inválido'),

    body('fecha_nacimiento')
        .optional()
        .isDate().withMessage('Fecha de nacimiento inválida')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 5 || age > 100) {
                throw new Error('Edad debe estar entre 5 y 100 años');
            }
            return true;
        }),

    body('telefono')
        .optional({checkFalsy:true})
        .matches(/^[0-9]{7,15}$/).withMessage('Teléfono debe tener entre 7 y 15 dígitos'),
    
    body('codigo_estudiante')
        .if(body('rol_id').equals('3'))
        .optional()
        .isLength({ min: 3, max:20}).withMessage('Código de estudiante debe tener entre 3 y 20 caracteres'),

    body('grupo_id_grupo')
        .if(body('rol_id').equals('3'))
        .optional()
        .isNumeric().withMessage('ID de grupo inválido'),

    body('especialidad')
        .if(body('rol_id').equals('2'))
        .optional()
        .isLength({ max: 100}).withMessage('Especialidad no puede exceder 100 caracteres'),
    
    body('titulo_profesional')
        .if(body('rol_id').equals('2'))
        .optional()
        .isLength({ max: 100}).withMessage('Título profesional no puede exceder 100 caracteres'),

];

// Validador para login
const validateLogin = [
    body('nombre_usuario')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isLength({ min: 3, max: 50 }).withMessage('Usuario debe tener entre 3 y 50 caracteres'),
    
    body('contrasena')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
];

// Validador para ID en parámetros
const validateIdParam = [
    param('id')
        .isNumeric().withMessage('ID debe ser numérico')
        .notEmpty().withMessage('ID es requerido'),
];

const validateRolParam = [
    param('id_rol')
        .isNumeric().withMessage('ID de rol debe ser numérico')
        .notEmpty().withMessage('ID de rol es requerido')
        .isIn(['1', '2', '3']).withMessage('Rol debe ser 1, 2 o 3'),
];

// Validador para estado de usuario
const validateUserStatus = [
    param('id_usuario')
        .isNumeric().withMessage('ID de usuario debe ser numérico'),
    body('activo')
        .notEmpty().withMessage('El estado es requerido')
        .isIn([0, 1]).withMessage('Estado debe ser 0 o 1'),
];

const validateGroup = [
    body('nombre_grupo')
        .notEmpty().withMessage('El nombre del grupo es requerido')
        .isLength({ min: 1, max: 10 }).withMessage('Nombre de grupo debe tener entre 1 y 10 caracteres')
        .matches(/^[a-zA-Z0-9\-]+$/).withMessage('Nombre de grupo solo debe contener letras, números y guiones'),
    
    body('anio_escolar')
        .notEmpty().withMessage('El año escolar es requerido')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año escolar inválido'),
    
    body('capacidad_maxima')
        .notEmpty().withMessage('La capacidad máxima es requerida')
        .isInt({ min: 1, max: 50 }).withMessage('Capacidad máxima debe estar entre 1 y 50'),
    
    body('grado_id_grado')
        .notEmpty().withMessage('El grado es requerido')
        .isNumeric().withMessage('ID de grado inválido'),
    
    body('docente_id_docente')
        .optional()
        .isNumeric().withMessage('ID de docente inválido'),
];

const validateMateria = [
    body('codigo_materia')
        .notEmpty().withMessage('El código de materia es requerido')
        .isLength({ min: 3, max: 20 }).withMessage('Código debe tener entre 3 y 20 caracteres'),
    
    body('nombre_materia')
        .notEmpty().withMessage('El nombre de la materia es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    
    body('intensidad_horaria_semanal')
        .notEmpty().withMessage('La intensidad horaria es requerida')
        .isInt({ min: 1, max: 20 }).withMessage('Intensidad horaria debe estar entre 1 y 20 horas'),
    
    body('descripcion')
        .optional()
        .isLength({ max: 500 }).withMessage('Descripción no puede exceder 500 caracteres'),
];

const validateAsignacion = [
    body('anio_escolar')
        .notEmpty().withMessage('El año escolar es requerido')
        .isInt({ min: 2000, max: 2100 }).withMessage('Año escolar inválido'),
    
    body('materia_id_materia')
        .notEmpty().withMessage('La materia es requerida')
        .isNumeric().withMessage('ID de materia inválido'),
    
    body('grupo_id_grupo')
        .notEmpty().withMessage('El grupo es requerido')
        .isNumeric().withMessage('ID de grupo inválido'),
    
    body('docente_id_docente')
        .notEmpty().withMessage('El docente es requerido')
        .isNumeric().withMessage('ID de docente inválido'),
];

const validateEstudiante = [
    body('numero_identificacion')
        .notEmpty().withMessage('La identificación es requerida')
        .matches(/^[0-9]+$/).withMessage('Identificación solo debe contener números'),
    
    body('nombres')
        .notEmpty().withMessage('Los nombres son requeridos')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombres solo debe contener letras'),
    
    body('apellido_paterno')
        .notEmpty().withMessage('El apellido paterno es requerido')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Apellido solo debe contener letras'),
    
    body('codigo_estudiante')
        .notEmpty().withMessage('El código de estudiante es requerido')
        .isLength({ min: 3, max: 20 }).withMessage('Código debe tener entre 3 y 20 caracteres'),
    
    body('grupo_id_grupo')
        .notEmpty().withMessage('El grupo es requerido')
        .isNumeric().withMessage('ID de grupo inválido'),
    
    body('correo_electronico')
        .optional()
        .isEmail().withMessage('Formato de correo electrónico inválido'),
];

const validateDocente = [
    body('numero_identificacion')
        .notEmpty().withMessage('La identificación es requerida')
        .matches(/^[0-9]+$/).withMessage('Identificación solo debe contener números'),
    
    body('nombres')
        .notEmpty().withMessage('Los nombres son requeridos')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombres solo debe contener letras'),
    
    body('codigo_docente')
        .notEmpty().withMessage('El código de docente es requerido')
        .isLength({ min: 3, max: 20 }).withMessage('Código debe tener entre 3 y 20 caracteres'),
    
    body('titulo_profesional')
        .optional()
        .isLength({ max: 100 }).withMessage('Título profesional no puede exceder 100 caracteres'),
    
    body('especialidad')
        .optional()
        .isLength({ max: 100 }).withMessage('Especialidad no puede exceder 100 caracteres'),
];

const validateCriterio = [
    body('id_asignacion')
        .notEmpty().withMessage('La asignación es requerida')
        .isNumeric().withMessage('ID de asignación inválido'),
    
    body('nombre_criterio')
        .notEmpty().withMessage('El nombre del criterio es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    
    body('porcentaje')
        .notEmpty().withMessage('El porcentaje es requerido')
        .isFloat({ min: 1, max: 100 }).withMessage('Porcentaje debe estar entre 1 y 100'),
];

const validateNota = [
    body('nota')
        .notEmpty().withMessage('La nota es requerida')
        .isFloat({ min: 0, max: 5 }).withMessage('Nota debe estar entre 0.0 y 5.0'),
    
    body('criterio_id')
        .notEmpty().withMessage('El criterio es requerido')
        .isNumeric().withMessage('ID de criterio inválido'),
    
    body('estudiante_id')
        .notEmpty().withMessage('El estudiante es requerido')
        .isNumeric().withMessage('ID de estudiante inválido'),
    
    body('asignacion_id')
        .notEmpty().withMessage('La asignación es requerida')
        .isNumeric().withMessage('ID de asignación inválido'),
    
    body('periodo_id')
        .notEmpty().withMessage('El período es requerido')
        .isNumeric().withMessage('ID de período inválido'),
    
    body('observaciones')
        .optional()
        .isLength({ max: 500 }).withMessage('Observaciones no puede exceder 500 caracteres'),
];

const validateIncapacidad = [
    body('fecha_inicio')
        .notEmpty().withMessage('La fecha de inicio es requerida')
        .isDate().withMessage('Fecha de inicio inválida'),
    
    body('fecha_fin')
        .notEmpty().withMessage('La fecha de fin es requerida')
        .isDate().withMessage('Fecha de fin inválida')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.fecha_inicio)) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
            return true;
        }),
    
    body('motivo')
        .notEmpty().withMessage('El motivo es requerido')
        .isLength({ min: 5, max: 500 }).withMessage('Motivo debe tener entre 5 y 500 caracteres'),
    
    body('docente_id_docente')
        .notEmpty().withMessage('El docente es requerido')
        .isNumeric().withMessage('ID de docente inválido'),
];

const validateUserIdParam = [
    param('id_usuario')
        .isNumeric().withMessage('ID de usuario debe ser numérico')
        .notEmpty().withMessage('ID de usuario es requerido'),
];

const validateDocenteIdParam = [
    param('id_docente')
        .isNumeric().withMessage('ID de Docente debe ser númerico')
        .notEmpty().withMessage('ID de docente es requerido'),
];

const validateAsignacionIdParam = [
    param('id_asignacion')
        .isNumeric().withMessage('ID de asignación debe ser numérico')
        .notEmpty().withMessage('ID de asignación es requerido')
];

const validateGrupoIdParam = [
    param('id_grupo')
        .isNumeric().withMessage('ID de grupo debe ser numérico')
        .notEmpty().withMessage('ID de grupo es requerido'),
];
module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserUpdate,
    validateLogin,
    validateIdParam,
    validateUserIdParam,
    validateRolParam,
    validateUserStatus,
    validateGroup,
    validateMateria,
    validateAsignacion,
    validateEstudiante,
    validateDocente,
    validateCriterio,
    validateNota,
    validateIncapacidad,
    validateDocenteIdParam,
    validateAsignacionIdParam,
    validateGrupoIdParam
};
    

