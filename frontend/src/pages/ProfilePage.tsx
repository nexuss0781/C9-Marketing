// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';

interface PublicProfile {
    username: string;
    profilePhotoUrl: string;
    bio: string;
    member_since: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const { username } = useParams<{ username: string }>();

    useEffect(() => {
        if (username) {
            api.get(`/users/${username}`)
                .then(res => setProfile(res.data))
                .catch(err => console.error("Failed to fetch profile", err));
        }
    }, [username]);

    if (!profile) return <div>Loading profile...</div>

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="container mx-auto px-6 py-8">
                <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                    <img src={profile.profilePhotoUrl} alt={profile.username} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-indigo-500" />
                    <h1 className="text-4xl font-bold">{profile.username}</h1>
                    <p className="text-gray-400">Member since {new Date(profile.member_since).toLocaleDateString()}</p>
                    <p className="mt-4 text-lg">{profile.bio || "This user hasn't written a bio yet."}</p>
                </div>
            </main>
        </div>
    );
}