// src/pages/LoginPage.tsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!phone || !password) { setError('All fields are required.'); return; }
        try {
            const response = await api.post('/auth/login', { phone, password });
            auth?.login(response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Login failed.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Link to="/" className="text-center mb-8 group">
                <h1 className="text-5xl font-bold text-white group-hover:text-primary transition-colors">C9</h1>
                <p className="text-subtle">Sign in to continue</p>
            </Link>
            <div className="p-8 card-base w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label-primary">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-primary"/>
                    </div>
                    <div>
                        <label className="label-primary">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-primary"/>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full btn-primary text-lg py-3">
                        Sign In
                    </button>
                </form>
                <p className="text-center text-subtle mt-6">
                    Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}