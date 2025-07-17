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
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg border-b border-muted/50">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/dashboard" className="text-2xl font-bold text-white hover:text-primary transition-colors">
                    C9
                </Link>
                <div className="flex items-center space-x-5">
                    <Link to="/my-orders" className="text-xl text-subtle hover:text-white" title="My Orders"><FiBox /></Link>
                    <div className="relative">
                        <button onClick={() => setShowNotifications(p => !p)} className="text-xl text-subtle hover:text-white" title="Notifications"><FiBell /></button>
                        {showNotifications && <Notifications />}
                    </div>
                    <Link to="/settings" className="text-xl text-subtle hover:text-white" title="Settings"><FiSettings /></Link>
                    <Link to="/sell" className="btn-primary flex items-center gap-2 text-sm">
                        <FiPlusCircle /> Sell Item
                    </Link>
                    <button onClick={handleLogout} title="Logout" className="text-xl text-subtle hover:text-red-500"><FiLogOut /></button>
                </div>
            </nav>
        </header>
    );
}