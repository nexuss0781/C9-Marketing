// src/pages/SignupPage.tsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '', username: '', phone: '', email: '', password: '', address: ''
  });
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(formData).some(val => val === '')) {
        setError('All fields are required.');
        return;
    }
    try {
      const response = await api.post('/auth/signup', formData);
      auth?.login(response.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
          <input name="username" placeholder="Username" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
          <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
          <input name="password" type="password" placeholder="Password (min. 6 characters)" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
          <input name="address" placeholder="Address" onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 mt-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold">
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
