import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';


import Login from './pages/Login/Login';
import MenuPrincipal from './pages/MenuPrincipal/MenuPrincipal';
import MainLayout from './components/MainLayout';
import GestionUsuarios from './pages/Admin/GestionUsuarios';
import FormularioRegistro from './pages/Admin/FormularioRegistro';
import GestionGrupos from './pages/Admin/GestionGrupos';
import GestionMaterias from './pages/Admin/GestionMaterias';
import AsignacionAcademica from './pages/Admin/AsignacionAcademica';  
// import MisNotas from './pages/Estudiante/MisNotas';
import './App.css'

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className='loading-screen'>
        <div className='spinner'></div>
        <p>Cargando ...</p>
      </div>
  )};

  return (
    <Routes>
      
      <Route path="/login" element={<Login />} />

      <Route 
        path="/MenuPrincipal" 
        element={
          <MainLayout>
            <MenuPrincipal />
          </MainLayout>
        }
      >
        
        <Route 
          index 
          element={
            <div className='main-content'>
              <header className="bienvenida-header">
                <h1>Bienvenido, {user?.nombres || 'Usuario'}</h1>
              </header>
              <section className='texto-informativo'>
                <p>Selecciona una opción a la izquierda para gestionar el sistema.</p>
              </section>
              <section className='redes-sociales' style={{ marginTop: '30px'}}>
                <h3>Redes Sociales Institucionales</h3>
                <div className="iconos-redes">
                  <span className='circulo-icono'>F</span>
                  <span className='circulo-icono'>X</span>
                  <span className='circulo-icono'>I</span>
                </div>
                <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
                  Conéctacte con la comunidad Educativa.
                </p>
              </section>
            </ div>
          } 
        />

        <Route path="admin/usuarios" element={<GestionUsuarios />} />
        <Route path="admin/usuarios/nuevo" element={<FormularioRegistro />} />
        <Route path="admin/usuarios/editar/:id_usuario" element={<FormularioRegistro />} />
        <Route path="admin/grupos" element={<GestionGrupos />} />
        <Route path="admin/materias" element={<GestionMaterias />} />
        <Route path="admin/asignacion" element={<AsignacionAcademica />} />
      </Route>

      {/* 5. Redirecciones de seguridad */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;