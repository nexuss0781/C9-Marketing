// src/pages/SignupPage.tsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function SignupPage() {
    const [formData, setFormData] = useState({ fullName: '', username: '', phone: '', email: '', password: '', address: '' });
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (Object.values(formData).some(val => val === '')) { setError('All fields are required.'); return; }
        try {
            const response = await api.post('/auth/signup', formData);
            auth?.login(response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) { setError(err.response?.data?.msg || 'Signup failed.'); }
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white p-4">
            <Link to="/" className="text-center mb-5 text-decoration-none">
                <h1 className="display-1 fw-bold text-white">C9</h1>
                <p className="text-muted">Create your account</p>
            </Link>
            <div className="card bg-secondary p-5 w-100" style={{ maxWidth: '448px' }}>
                <form onSubmit={handleSubmit} className="vstack gap-3">
                    <input name="fullName" placeholder="Full Name" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    <input name="username" placeholder="Username" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    <input name="password" type="password" placeholder="Password (min. 6 characters)" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    <input name="address" placeholder="Address" onChange={handleChange} className="form-control bg-dark text-white border-secondary" />
                    {error && <p className="text-danger text-center">{error}</p>}
                    <button type="submit" className="w-100 btn btn-primary btn-lg mt-4">Create Account</button>
                </form>
                <p className="text-center text-muted mt-4">
                    Already have an account? <Link to="/login" className="fw-bold text-primary">Login</Link>
                </p>
            </div>
        </div>
    );
}