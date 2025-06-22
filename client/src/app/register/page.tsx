'use client'
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import Logo from '@/components/Logo';

export default function RegisterPage() {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <Logo />
                <h1>Create an Account</h1>
                <RegisterForm />
                <div className="auth-footer">
                    Already have an account? <Link href="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}
