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
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white p-4">
            <Link to="/" className="text-center mb-5 text-decoration-none">
                <h1 className="display-1 fw-bold text-white">C9</h1>
                <p className="text-muted">Sign in to continue</p>
            </Link>
            <div className="card bg-secondary p-5 w-100" style={{ maxWidth: '448px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-control bg-dark text-white border-secondary"/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control bg-dark text-white border-secondary"/>
                    </div>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <button type="submit" className="w-100 btn btn-primary btn-lg mt-4">
                        Sign In
                    </button>
                </form>
                <p className="text-center text-muted mt-4">
                    Don't have an account? <Link to="/signup" className="fw-bold text-primary">Sign up</Link>
                </p>
            </div>
        </div>
    );
}