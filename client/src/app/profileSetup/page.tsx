'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from "@/components/Loader";

type User = {
    loggedIn: true;
    email: string;
    photoUrl?: string;
    firstName?: string;
    lastName?: string;
} | {
    loggedIn: false;
} | null;

export default function ProfileSetup() {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState<'success' | 'error' | 'info'>('info');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    // Dohvati trenutne podatke korisnika i redirectaj ako je profil već kompletiran
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/me`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.loggedIn) {
                        router.replace('/login');
                        return;
                    }
                    // Ako korisnik već ima ime i prezime, redirectaj na profil
                    if (data.firstName && data.lastName) {
                        router.replace('/profile');
                        return;
                    }
                    setUser(data);
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    if (data.photoUrl) setPreview(data.photoUrl.startsWith('http') ? data.photoUrl : `${API_URL}${data.photoUrl}`);
                } else {
                    router.replace('/login');
                }
            } catch {
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [API_URL, router]);

    // Drag & drop/klik upload
    const handlePhotoChange = (file: File) => {
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePhotoChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handlePhotoChange(e.target.files[0]);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        setMsgType('info');
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        if (photo) formData.append('photo', photo);

        const res = await fetch(`${API_URL}/api/profile`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (res.ok) {
            setMsgType('success');
            setMsg('Profile updated!');
            window.dispatchEvent(new Event('userUpdated'));
            setTimeout(() => router.replace('/profile'), 1000);
        } else {
            setMsgType('error');
            const data = await res.json();
            setMsg(data.message || 'Update failed');
        }
    };

    // Automatski ukloni success poruku nakon 2s
    useEffect(() => {
        if (msg && msgType === 'success') {
            const timeout = setTimeout(() => setMsg(''), 2000);
            return () => clearTimeout(timeout);
        }
    }, [msg, msgType]);

    if (loading) return <Loader />;
    if (!user || !user.loggedIn) return null;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
                    <h2>Profile Setup</h2>
                    {/* Photo upload */}
                    <div
                        className={`photo-upload${preview ? ' has-photo' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        tabIndex={0}
                        aria-label="Upload profile photo"
                    >
                        {preview ? (
                            <div className="photo-preview-wrapper">
                                <img src={preview} alt="Preview" className="photo-preview" />
                                <button
                                    type="button"
                                    className="photo-remove"
                                    onClick={e => {
                                        e.stopPropagation();
                                        removePhoto();
                                    }}
                                    title="Remove photo"
                                    aria-label="Remove photo"
                                ></button>
                            </div>
                        ) : (
                            <div className="photo-placeholder">
                                <span>Drag & drop or click to upload photo</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id="photo"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileInput}
                        />
                    </div>
                    {/* Name fields */}
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="Your first name"
                            autoComplete="given-name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Your last name"
                            autoComplete="family-name"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Save Profile</button>
                    {msg && <div className={`form-message ${msgType}`}>{msg}</div>}
                </form>
            </div>
        </div>
    );
}
