import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';

const ConfigurarCriterios = ({  }) => {

    const { idAsignacion, nombreMateria} = useParams();
    const [criterios, setCriterios] = useState([]);
    const [nuevoCriterio, setNuevoCriterio] = useState({ nombre_criterio: '', porcentaje: '' });
    

    const cargarCriterios = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/notas/criterios/${idAsignacion}`, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setCriterios(res.data);
        } catch (error) {
            console.error("Error 401: no autoriza o token inválido", error);
        }
    };

    useEffect(() => { if (idAsignacion) cargarCriterios(); }, [idAsignacion]);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/notas/crear-criterio', {
                ...nuevoCriterio, id_asignacion: idAsignacion
            }, {
                headers: { Authorization: `Bearer ${token}`}
            });
            Swal.fire('¡Listo!', 'Criterio agregado', 'success');
            setNuevoCriterio({ nombre_criterio: '', porcentaje: '' });
            cargarCriterios();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.msg || 'Error', 'error');
        }
    };

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