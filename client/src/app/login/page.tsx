'use client'
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import Logo from '@/components/Logo';
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function LoginPage() {
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
                <h1>Login to Showfolio</h1>
                <LoginForm />
                <div className="auth-footer">
                    Don&#39;t have an account? <Link href="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}
