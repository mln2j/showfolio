'use client'
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NavBar() {
    const { user, loading } = useCurrentUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // @ts-expect-error Ne razumijem ovaj error
    useOnClickOutside(dropdownRef, () => setMenuOpen(false));

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
        });
        window.location.href = "/login";
    };

    // Hamburger ikona za mobile
    const Hamburger = (
        <button
            className="navbar-hamburger"
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
        >
            <span className={`hamburger-bar${menuOpen ? ' open' : ''}`}></span>
            <span className={`hamburger-bar${menuOpen ? ' open' : ''}`}></span>
            <span className={`hamburger-bar${menuOpen ? ' open' : ''}`}></span>
        </button>
    );

    // Linkovi za user meni
    const userLinks = (
        <>
            <Link href="/profile" className="navbar-dropdown-link">Profile</Link>
            <Link href="/my-showfolio" className="navbar-dropdown-link">My Showfolio</Link>
            <Link href="/settings" className="navbar-dropdown-link">Settings</Link>
            <button className="navbar-dropdown-link logout" onClick={handleLogout}>Logout</button>
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
                        {/* Desktop dropdown */}
                        <div className="navbar-user-desktop" ref={dropdownRef}>
                            <button
                                className="navbar-avatar-btn"
                                onClick={() => setMenuOpen(v => !v)}
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
                                <span className="navbar-user-name">{user.firstName || ''} {user.lastName || ''}</span>
                            </button>
                            <div className={`navbar-dropdown${menuOpen ? " open" : ""}`}>
                                <div className="navbar-dropdown-info">
                                    <strong>{user.firstName || ""} {user.lastName || ""}</strong>
                                </div>
                                <div className="navbar-dropdown-divider"></div>
                                {userLinks}
                            </div>
                        </div>
                        {/* Hamburger za mobile */}
                        <div className="navbar-mobile-menu-btn">
                            {Hamburger}
                        </div>
                        {/* Mobile fullscreen meni */}
                        <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
                            <div className="navbar-mobile-menu-content">
                                <button
                                    className="navbar-mobile-close"
                                    aria-label="Close menu"
                                    onClick={() => setMenuOpen(false)}
                                >×</button>
                                <div className="navbar-mobile-user">
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
                                <div className="navbar-mobile-links">
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
