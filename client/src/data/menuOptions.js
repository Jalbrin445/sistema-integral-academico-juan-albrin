export const MENU_OPCIONES = {
    1: [
        { label: 'Gestión de Usuarios', path: 'admin/usuarios' },
        { label: 'Configuración de Grupos', path: 'admin/grupos' },
        {label: 'Asignación de Materias'},
        {label: 'Control de Incapacidades'},
        { label: 'Reportes', path: 'admin/reportes' }
    ],
    2: [
        { label: 'Carga Académica', path:'docente/carga'},
        { label: 'Registrar Calificaciones', path: 'docente/notas' },
        { label: 'Reportar Incapacidad', path: 'docente/incapacidad' },
        { label: 'Mis Estudiantes', path: 'docente/estudiantes'}
    ],
    3: [ 
        { label: 'Notas Académicas', path: 'estudiante/notas' },
        { label: 'Historial Académico', path: 'estudiante/historial' },
        { label: 'Información Institucional', path: 'estudiante/info' }
    ]
};