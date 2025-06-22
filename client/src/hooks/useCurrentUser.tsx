'use client'
import { useEffect, useState } from "react";

type User =
    | { loggedIn: true; email: string; photoUrl?: string; firstName?: string; lastName?: string }
    | { loggedIn: false }
    | null;

export function useCurrentUser() {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // Funkcija za dohvat korisnika
    const fetchUser = () => {
        setLoading(true);
        fetch(`${API_URL}/api/me`, {
            credentials: "include",
        })
            .then(res => res.ok ? res.json() : { loggedIn: false })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setUser({ loggedIn: false });
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUser();

        // Slušaj custom event za osvježavanje usera
        const handler = () => fetchUser();
        window.addEventListener('userUpdated', handler);

        // Cleanup
        return () => window.removeEventListener('userUpdated', handler);
    }, [API_URL]);

    return { user, loading };
}
