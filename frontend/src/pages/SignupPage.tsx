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
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Link to="/" className="text-center mb-8 group">
                <h1 className="text-5xl font-bold text-white group-hover:text-primary transition-colors">C9</h1>
                <p className="text-subtle">Create your account</p>
            </Link>
            <div className="p-8 card-base w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="fullName" placeholder="Full Name" onChange={handleChange} className="input-primary" />
                    <input name="username" placeholder="Username" onChange={handleChange} className="input-primary" />
                    <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="input-primary" />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input-primary" />
                    <input name="password" type="password" placeholder="Password (min. 6 characters)" onChange={handleChange} className="input-primary" />
                    <input name="address" placeholder="Address" onChange={handleChange} className="input-primary" />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full btn-primary text-lg py-3 mt-2">Create Account</button>
                </form>
                <p className="text-center text-subtle mt-6">
                    Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}