// src/components/Header.tsx
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Notifications from './Notifications';
import { FiBell, FiSettings, FiLogOut, FiPlusCircle, FiBox } from 'react-icons/fi';

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const handleLogout = () => { auth?.logout(); navigate('/'); };

    return (
        <header className="bg-light shadow-sm">
            <nav className="container d-flex justify-content-between align-items-center py-3">
                <Link to="/dashboard" className="text-decoration-none text-dark fs-4 fw-bold">
                    C9
                </Link>
                <div className="d-flex align-items-center">
                    <Link to="/my-orders" className="text-secondary me-3" title="My Orders"><FiBox size={24} /></Link>
                    <div className="position-relative me-3">
                        <button onClick={() => setShowNotifications(p => !p)} className="btn btn-link text-secondary p-0" title="Notifications"><FiBell size={24} /></button>
                        {showNotifications && <Notifications />}
                    </div>
                    <Link to="/settings" className="text-secondary me-3" title="Settings"><FiSettings size={24} /></Link>
                    <Link to="/sell" className="btn btn-primary d-flex align-items-center">
                        <FiPlusCircle className="me-2" /> Sell Item
                    </Link>
                    <button onClick={handleLogout} title="Logout" className="btn btn-link text-danger p-0 ms-3"><FiLogOut size={24} /></button>
                </div>
            </nav>
        </header>
    );
}