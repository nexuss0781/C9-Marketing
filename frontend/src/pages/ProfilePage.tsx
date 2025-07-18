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

    if (!profile) return <div className="bg-dark text-white min-vh-100 text-center p-5">Loading profile...</div>

    return (
        <div className="min-vh-100 bg-dark text-white">
            <Header />
            <main className="container py-5">
                <div className="col-md-8 mx-auto bg-secondary p-5 rounded-3 shadow-lg text-center">
                    <img src={profile.profilePhotoUrl} alt={profile.username} className="rounded-circle mx-auto mb-4 border border-4 border-primary" style={{ width: '128px', height: '128px' }} />
                    <h1 className="display-4 fw-bold">{profile.username}</h1>
                    <p className="text-muted">Member since {new Date(profile.member_since).toLocaleDateString()}</p>
                    <p className="mt-4 fs-5">{profile.bio || "This user hasn't written a bio yet."}</p>
                </div>
            </main>
        </div>
    );
}