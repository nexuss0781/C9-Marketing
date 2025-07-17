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

    if (!formData) return <div>Loading...</div>;

    return (
        <div className="bg-background">
            <Header />
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Your Settings</h1>
                    <div className="card-base p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div><label className="label-primary">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-primary"/></div>
                            <div><label className="label-primary">Profile Photo URL</label><input type="text" name="profilePhotoUrl" value={formData.profilePhotoUrl} onChange={handleChange} className="input-primary"/></div>
                            <div><label className="label-primary">Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="input-primary"/></div>
                            <div><label className="label-primary">Bio</label><textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className="input-primary"/></div>
                            <div><label className="label-primary">Contact & Pickup Preferences</label><textarea name="preferences" value={formData.preferences || ''} onChange={handleChange} rows={3} placeholder="e.g., Prefers cash on pickup..." className="input-primary"/></div>
                            <div><label className="label-primary">Telegram Username</label><input type="text" name="telegram" value={formData.socialMedia?.telegram || ''} onChange={handleChange} className="input-primary"/></div>
                            {message && <p className="text-green-400 text-center">{message}</p>}
                            <button type="submit" className="w-full btn-primary py-3 text-lg">Save Changes</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}