'use client'
import { useState } from 'react';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        setMsg(data.message || (res.ok ? 'Prijava uspješna!' : 'Greška'));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Prijava</h2>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Korisničko ime" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" required />
            <button type="submit">Prijavi se</button>
            <div>{msg}</div>
        </form>
    );
}
