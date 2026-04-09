
function Footer() {
    return (
        <footer className="footer-principal">
            <div className="footer-contenido">
                <div className="footer-seccion">
                    <h4>
                        Puntos de Atención Institucionales:
                    </h4>
                    <p>Telefono celular: 31212323423</p>
                    <p>Correo Electrónico: <a href={'mailto:${correo}'} className="email-link">atencionusuario@instandes.edu.co</a></p>
                </div>
                <div className="footer-seccion">
                    <p>
                        Recuerde que un uso indebido 
                        de los medios de comunicación 
                        puede llevalo a sanción o penalización
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;