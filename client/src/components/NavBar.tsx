'use client'
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NavBar() {
    const {user, loading} = useCurrentUser();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // @ts-expect-error Ne razumijem ovaj error
    useOnClickOutside(dropdownRef, () => setOpen(false));

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
        });
        window.location.href = "/login";
    };

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-logo">Showfolio</Link>
            <div className="navbar-links">
                {!loading && (!user || !user.loggedIn) && (
                    <>
                        <Link href="/login" className="navbar-link navbar-login">Login</Link>
                        <span className="navbar-divider">|</span>
                        <Link href="/register" className="navbar-link">Get Started</Link>
                    </>
                )}
                {!loading && user?.loggedIn && (
                    <div className="navbar-avatar-wrapper" ref={dropdownRef}>
                        <button
                            className="navbar-avatar-btn"
                            onClick={() => setOpen(v => !v)}
                            aria-label="Open user menu"
                        >
                            {user.photoUrl ? (
                                <img
                                    src={user.photoUrl.startsWith('http') ? user.photoUrl : `${API_URL}${user.photoUrl}`}
                                    alt="Profile"
                                    className="navbar-avatar"
                                />
                            ) : (
                                <span className="navbar-initial">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                        </button>
                        <div className={`navbar-dropdown${open ? " open" : ""}`}>
                            <div className="navbar-dropdown-info">
                                <strong>{user.firstName || ""} {user.lastName || ""}</strong>
                            </div>
                            <div className="navbar-dropdown-divider"></div>
                            <Link href="/profile" className="navbar-dropdown-link">Profile</Link>
                            <button className="navbar-dropdown-link logout" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
