import React, { useState, useEffect } from 'react';
import siaApi from '../../api/siaApi';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';

const ConfigurarCriterios = ({  }) => {

    const { idAsignacion, nombreMateria} = useParams();
    const [criterios, setCriterios] = useState([]);
    const [nuevoCriterio, setNuevoCriterio] = useState({ nombre_criterio: '', porcentaje: '' });
    const [cargando, setCargando] = useState(false);

    const cargarCriterios = async () => {
        try {
            setCargando(true);
            const res = await siaApi.get(`/notas/criterios/${idAsignacion}`);
            
            setCriterios(res.data);
        } catch (error) {
            console.error("Error al cargar criterios: ", error);
            if (error.response?.status === 404) {
                Swal.fire('Error', 'No se encontraron criterios para esta asignación', 'warning');
            } else if (error.response?.status === 401) {
                Swal.fire('Error', 'Sesión expirada, por favor inicia sesión nuevamente', 'error');
            }
        } finally {
                setCargando(false);
            }
        };

    useEffect(() => { 
        if (idAsignacion) {
            cargarCriterios();
        } 
    }, [idAsignacion]);

    const handleCrear = async (e) => {
        e.preventDefault();

        if (!nuevoCriterio.nombre_criterio.trim()) {
            Swal.fire('Error', 'El nobre del criterio es obligatorio', 'warning');
            return;
        }
        
        const porcentajeNum = parseFloat(nuevoCriterio.porcentaje);
        if (!nuevoCriterio.porcentaje || porcentajeNum<1 || porcentajeNum>100) {
            Swal.fire('Error', 'El porcentaje debe estar entre 1 y 100', 'warning');
            return;
        }
        try {
            
            await siaApi.post('/notas/crear-criterio', {
                id_asignacion: idAsignacion,
                nombre_criterio: nuevoCriterio.nombre_criterio,
                porcentaje: parseFloat(nuevoCriterio.porcentaje)
            });
            Swal.fire('¡Listo!', 'Criterio agregado', 'success');
            setNuevoCriterio({ nombre_criterio: '', porcentaje: '' });
            cargarCriterios();
        } catch (error) {
            console.error('Error al crear criterio: ', error);
            if (error.response?.data?.msg) {
                Swal.fire('Error', error.response.data.msg, 'error');
            } else {
                Swal.fire('Error', 'Error al crear el criterio', 'error');
            }
            
        }
    };

    const totalPorcentaje = criterios.reduce((sum, c) => sum + parseFloat(c.porcentaje), 0);
    const restante = 100 - totalPorcentaje;

    if (cargando) {
        return <div className="text-center p-4">Cargando criterios...</div>;
    }

    return (
        <div className="card-config-criterios p-4 mt-3">
            <h6>Configurar Evaluación: {nombreMateria}</h6>
            <form onSubmit={handleCrear} className="row g-2 mb-3">
                <div className="col-md-7"><input type="text" className="form-control" placeholder="Nombre" value={nuevoCriterio.nombre_criterio} onChange={e => setNuevoCriterio({...nuevoCriterio, nombre_criterio: e.target.value})} required /></div>
                <div className="col-md-3"><input type="number" className="form-control" placeholder="%" value={nuevoCriterio.porcentaje} onChange={e => setNuevoCriterio({...nuevoCriterio, porcentaje: e.target.value})} required /></div>
                <div className="col-md-2"><button className="btn btn-primary w-100">+</button></div>
            </form>
            {criterios.map(c => (
                <div key={c.id_criterio} className="criterio-item">
                    <span>{c.nombre_criterio}</span>
                    <span className="porcentaje-badge">{c.porcentaje}%</span>
                </div>
            ))}
        </div>
    );
};
export default ConfigurarCriterios;