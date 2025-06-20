'use client'
import { useState } from 'react';

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        const res = await fetch('http://localhost:5050/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        setMsg(data.message || (res.ok ? 'Registracija uspješna!' : 'Greška'));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registracija</h2>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Korisničko ime" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" required />
            <button type="submit">Registriraj se</button>
            <div>{msg}</div>
        </form>
    );
}
