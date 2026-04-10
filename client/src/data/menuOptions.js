export const MENU_OPCIONES = {
    1: [
        { label: 'Gestión de Usuarios', path: 'admin/usuarios' },
        { label: 'Configuración de Grupos', path: '/MenuPrincipal/admin/grupos', icono: "bi bi-grid-3x3-gap-fill" },
        {label: 'Asignación de Materias', path: '/MenuPrincipal/admin/asignacion'},
        {label: 'Gestionar Materias', path: '/MenuPrincipal/admin/materias'},
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