'use client'
import React from 'react';
import { useState } from 'react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (res.ok) {
            setTimeout(() => {
                window.location.href = '/profileSetup';
            }, 2000000); // 200-300ms je dovoljno
        } else {
            const data = await res.json();
            setMsg(data.message || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                />
            </div>

            <button type="submit" className="btn-primary">Login</button>

            {msg && <div className="form-message">{msg}</div>}
        </form>
    );
}
