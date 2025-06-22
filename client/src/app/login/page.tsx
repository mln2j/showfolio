'use client'
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import Logo from '@/components/Logo';

export default function LoginPage() {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <Logo />
                <h1>Login to Showfolio</h1>
                <LoginForm />
                <div className="auth-footer">
                    Don&#39;t have an account? <Link href="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}
