'use client'
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NavBar() {
    const { user, loading } = useCurrentUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // @ts-expect-error Ne razumijem ovaj error
    useOnClickOutside(menuRef, () => setMenuOpen(false));

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
        });
        window.location.href = "/login";
    };

    const userLinks = (
        <>
            <Link href="/profile" className="navbar-sheet-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link href="/my-showfolio" className="navbar-sheet-link" onClick={() => setMenuOpen(false)}>My Showfolio</Link>
            <Link href="/settings" className="navbar-sheet-link" onClick={() => setMenuOpen(false)}>Settings</Link>
            <button className="navbar-sheet-link logout" onClick={handleLogout}>Logout</button>
        </>
    );

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
                    <>
                        {/* Desktop: avatar + ime + popup */}
                        <div className="navbar-user-desktop">
                            <button
                                className="navbar-avatar-btn"
                                aria-label="User menu"
                                tabIndex={0}
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
                                <span className="navbar-user-name">{user.firstName || ''} {user.lastName || ''}</span>
                            </button>
                            {/* ...možeš dodati svoj dropdown za desktop kao prije */}
                        </div>
                        {/* Mobile: hamburger */}
                        <button
                            className={`navbar-hamburger${menuOpen ? " open" : ""}`}
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(v => !v)}
                        >
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </button>
                        {/* Mobile sheet meni */}
                        <div className={`navbar-sheet${menuOpen ? " open" : ""}`} ref={menuRef}>
                            <div className="navbar-sheet-content">
                                <div className="navbar-sheet-header">
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
                                    <div>
                                        <strong>{user.firstName || ""} {user.lastName || ""}</strong>
                                        <div className="navbar-email">{user.email}</div>
                                    </div>
                                </div>
                                <div className="navbar-sheet-links">
                                    {userLinks}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
