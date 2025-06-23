import { useEffect, useState } from "react";

export function usePublicShowfolio(username: string) {
    const [showfolio, setShowfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/api/showfolio/${username}`)
            .then(res => res.json())
            .then(data => { setShowfolio(data); setLoading(false); });
    }, [username]);

    return { showfolio, loading };
}
