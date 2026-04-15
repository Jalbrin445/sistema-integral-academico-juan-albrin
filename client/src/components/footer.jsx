function Footer() {
    return (
        <footer className="footer-principal">
            <div className="footer-contenido">
                <div className="footer-seccion">
                    <h5>Contacto Institucional</h5>
                    <p><i className="bi bi-telephone"></i> +57 312 123 2342</p>
                    <p><i className="bi bi-envelope"></i> <a href="mailto:atencionusuario@instandes.edu.co" className="email-link">atencionusuario@instandes.edu.co</a></p>
                </div>
                <div className="footer-seccion text-center">
                    <p className="copyright">© 2026 Instandes Académico. Todos los derechos reservados.</p>
                </div>
                <div className="footer-seccion warning-box">
                    <p><i className="bi bi-exclamation-triangle"></i> El uso indebido de los medios institucionales puede acarrear sanciones académicas.</p>
                </div>
            </div>
        </footer>
    );
}
export default Footer;