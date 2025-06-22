'use client'
import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loader from "@/components/Loader";

export default function SettingsPage() {
    const { user, loading } = useCurrentUser();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState<"success" | "error" | "">("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [pwdMsg, setPwdMsg] = useState("");
    const [pwdType, setPwdType] = useState<"success" | "error" | "">("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

    // Popuni podatke kad se user učita/promijeni
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (user?.firstName) setFirstName(user.firstName);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (user?.lastName) setLastName(user.lastName);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (user?.photoUrl) setPreview(user.photoUrl.startsWith('http') ? user.photoUrl : `${API_URL}${user.photoUrl}`);
    }, [user]);

    // Upload nove slike
    const handlePhotoChange = (file: File) => {
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handlePhotoChange(e.target.files[0]);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setPreview(user?.photoUrl ? (user.photoUrl.startsWith('http') ? user.photoUrl : `${API_URL}${user.photoUrl}`) : null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Promjena imena, prezimena i slike
    const handleProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setMsgType("");
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        if (photo) formData.append("photo", photo);

        const res = await fetch(`${API_URL}/api/settings`, {
            method: "PATCH",
            credentials: "include",
            body: formData,
        });
        const data = await res.json();
        if (res.ok) {
            setMsgType("success");
            setMsg("Profile updated!");
            // Osvježi user hook (ako koristiš SWR ili custom event)
            window.dispatchEvent(new Event('userUpdated'));
        } else {
            setMsgType("error");
            setMsg(data.message || "Update failed");
        }
    };

    // Promjena lozinke
    const handlePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdMsg("");
        setPwdType("");
        const res = await fetch(`${API_URL}/api/settings/password`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
            setPwdType("success");
            setPwdMsg("Password changed!");
            setOldPassword(""); setNewPassword("");
        } else {
            setPwdType("error");
            setPwdMsg(data.message || "Change failed");
        }
    };

    if (loading) return <Loader />;
    if (!user || !user.loggedIn) return null;

    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <form onSubmit={handleProfile} className="settings-form">
                <h2>Update Profile</h2>
                {/* Photo upload */}
                <div className="form-group">
                    <label>Photo</label>
                    <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
                        {preview ? (
                            <div className="photo-preview-wrapper">
                                <img src={preview} alt="Preview" className="photo-preview" />
                                <button
                                    type="button"
                                    className="photo-remove"
                                    onClick={e => { e.stopPropagation(); removePhoto(); }}
                                    title="Remove photo"
                                >×</button>
                            </div>
                        ) : (
                            <div className="photo-placeholder">
                                <span>Click to upload photo</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileInput}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <button className="btn-primary" type="submit">Save</button>
                {msg && <div className={`form-message ${msgType}`}>{msg}</div>}
            </form>
            <form onSubmit={handlePassword} className="settings-form" style={{ marginTop: 32 }}>
                <h2>Change Password</h2>
                <div className="form-group">
                    <label>Old Password</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <button className="btn-primary" type="submit">Change Password</button>
                {pwdMsg && <div className={`form-message ${pwdType}`}>{pwdMsg}</div>}
            </form>
        </div>
    );
}
