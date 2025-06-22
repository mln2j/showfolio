'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import Logo from '@/components/Logo';

export default function RegisterPage() {
    const { user, loading } = useCurrentUser();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (user && user.loggedIn) {
                router.replace('/profile');
            } else {
                setChecked(true);
            }
        }
    }, [loading, user, router]);

    if (!checked) return null;

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
