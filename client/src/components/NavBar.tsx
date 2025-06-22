'use client'
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NavBar() {
    const { user, loading } = useCurrentUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // Zatvori mobilni meni kad klikneš izvan njega
    useOnClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));
    // Zatvori desktop dropdown kad line izvan njega
    useOnClickOutside(desktopDropdownRef, () => setDesktopDropdownOpen(false));

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
        });
        window.location.href = "/login";
    };

    // Navigacijski linkovi za oba menija
    const userLinks = (
        <>
            <Link href="/profile" className="navbar-sheet-link" onClick={() => { setMobileMenuOpen(false); setDesktopDropdownOpen(false); }}>Profile</Link>
            <Link href="/my-showfolio" className="navbar-sheet-link" onClick={() => { setMobileMenuOpen(false); setDesktopDropdownOpen(false); }}>My Showfolio</Link>
            <Link href="/settings" className="navbar-sheet-link" onClick={() => { setMobileMenuOpen(false); setDesktopDropdownOpen(false); }}>Settings</Link>
            <button className="navbar-sheet-link logout" onClick={handleLogout}>Logout</button>
        </>
    );

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-logo">Showfolio</Link>
            <div className="navbar-links">
                {/* Gosti */}
                {!loading && (!user || !user.loggedIn) && (
                    <>
                        <Link href="/login" className="navbar-link navbar-login">Login</Link>
                        <span className="navbar-divider">|</span>
                        <Link href="/register" className="navbar-link">Get Started</Link>
                    </>
                )}
                {/* Prijavljeni korisnik */}
                {!loading && user?.loggedIn && (
                    <>
                        {/* Desktop: avatar + ime + dropdown */}
                        <div className="navbar-user-desktop" ref={desktopDropdownRef}>
                            <button
                                className="navbar-avatar-btn"
                                aria-label="User menu"
                                tabIndex={0}
                                onClick={() => setDesktopDropdownOpen(v => !v)}
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
                            <div className={`navbar-dropdown${desktopDropdownOpen ? " open" : ""}`}>
                                {userLinks}
                            </div>
                        </div>
                        {/* Mobile: hamburger */}
                        <button
                            className={`navbar-hamburger${mobileMenuOpen ? " open" : ""}`}
                            aria-label="Open menu"
                            onClick={() => setMobileMenuOpen(v => !v)}
                        >
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </button>
                        {/* Mobile sheet meni */}
                        <div className={`navbar-sheet${mobileMenuOpen ? " open" : ""}`} ref={mobileMenuRef}>
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
