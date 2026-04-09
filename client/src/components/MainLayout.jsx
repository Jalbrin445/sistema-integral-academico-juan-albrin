import BarraNavegacion from './BarraNavegacion';
import Footer from './footer';

function MainLayout({ children }) {
    return (
        <div className="menu-principal-container">
            <BarraNavegacion />
            <main className="menu-layout">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
export default MainLayout;