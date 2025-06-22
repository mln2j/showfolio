'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch(`${API_URL}/api/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                // Ako nije prijavljen, redirect na login
                if (!data.loggedIn) {
                    router.replace('/login');
                    return;
                }
                setUser(data);
            } else {
                router.replace('/login');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [API_URL, router]);

    if (loading) return <div>Loading...</div>;
    if (!user) return null; // ili error poruka

    return (
        <div className="profile-page">
            <div className="profile-header">
                {user.photoUrl ? (
                    <img
                        src={user.photoUrl.startsWith('http') ? user.photoUrl : `${API_URL}${user.photoUrl}`}
                        alt="Profile"
                        className="profile-photo"
                    />
                ) : (
                    <div className="profile-initial">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                )}
                <h1>{user.firstName || ''} {user.lastName || ''}</h1>
                <p>{user.email}</p>
            </div>
        </div>
    );
}
