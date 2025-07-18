// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';

interface ProfileData { fullName: string; address: string; bio: string; profilePhotoUrl: string; socialMedia: { telegram?: string }; preferences: string; }

export default function SettingsPage() {
    const [formData, setFormData] = useState<ProfileData | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => { api.get('/me/profile').then(response => setFormData(response.data)); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'telegram') {
            setFormData(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, telegram: value } } : null);
        } else {
            setFormData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setMessage(''); if (!formData) return;
        try {
            const response = await api.put('/me/profile', formData);
            setMessage(response.data.msg);
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        } catch (err) { setMessage('Failed to update profile.'); }
    };

    if (!formData) return <div className="bg-dark text-white min-vh-100 text-center p-5">Loading...</div>;

    return (
        <div className="bg-dark text-white min-vh-100">
            <Header />
            <main className="container py-5">
                <div className="col-md-8 mx-auto">
                    <h1 className="display-4 fw-bold mb-5">Your Settings</h1>
                    <div className="card bg-secondary p-5">
                        <form onSubmit={handleSubmit} className="vstack gap-4">
                            <div><label className="form-label">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/></div>
                            <div><label className="form-label">Profile Photo URL</label><input type="text" name="profilePhotoUrl" value={formData.profilePhotoUrl} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/></div>
                            <div><label className="form-label">Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/></div>
                            <div><label className="form-label">Bio</label><textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className="form-control bg-dark text-white border-secondary"/></div>
                            <div><label className="form-label">Contact & Pickup Preferences</label><textarea name="preferences" value={formData.preferences || ''} onChange={handleChange} rows={3} placeholder="e.g., Prefers cash on pickup..." className="form-control bg-dark text-white border-secondary"/></div>
                            <div><label className="form-label">Telegram Username</label><input type="text" name="telegram" value={formData.socialMedia?.telegram || ''} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/></div>
                            {message && <p className="text-success text-center">{message}</p>}
                            <button type="submit" className="w-100 btn btn-primary btn-lg">Save Changes</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}