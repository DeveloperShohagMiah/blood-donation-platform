import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-dvh flex-col bg-foreground">
            <Navbar />
            <main className="flex-1 bg-background pb-28">

                {Outlet ? <Outlet /> : children}
            </main>
            <Footer />
        </div>
    )
}

export default Layout