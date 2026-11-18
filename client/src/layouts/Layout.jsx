import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const Layout = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main className=''>

                {Outlet ? <Outlet /> : children}
            </main>
            <Footer />
        </div>
    )
}

export default Layout