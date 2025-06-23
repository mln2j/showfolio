import { useEffect, useState } from "react";

export function useShowfolio() {
    const [showfolio, setShowfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/api/showfolio`, { credentials: "include" })
            .then(res => res.json())
            .then(data => { setShowfolio(data); setLoading(false); });
    }, []);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const saveShowfolio = async (data) => {
        const res = await fetch(`${API_URL}/api/showfolio`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        });
        const updated = await res.json();
        setShowfolio(updated);
        return updated;
    };

    return { showfolio, setShowfolio, saveShowfolio, loading };
}
