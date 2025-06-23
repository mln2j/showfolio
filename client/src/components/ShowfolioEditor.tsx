// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import { useShowfolio } from "@/hooks/useShowfolio";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function ShowfolioEditor() {
    const { showfolio, setShowfolio, saveShowfolio, loading } = useShowfolio();
    const [msg, setMsg] = useState("");

    // Helper za privacy radio
    const getPrivacy = () => {
        if (showfolio.isPublic) return "public";
        if (showfolio.isUnlisted) return "unlisted";
        return "private";
    };
    const [privacy, setPrivacy] = useState(getPrivacy());

    // Syncaj privacy kad se showfolio promijeni
    useEffect(() => {
        setPrivacy(getPrivacy());
    }, [showfolio]);

    // Kad korisnik promijeni radio, promijeni oba booleana
    const handlePrivacyChange = (value) => {
        setPrivacy(value);
        if (value === "public") {
            setShowfolio({ ...showfolio, isPublic: true, isUnlisted: false });
        } else if (value === "unlisted") {
            setShowfolio({ ...showfolio, isPublic: false, isUnlisted: true });
        } else {
            setShowfolio({ ...showfolio, isPublic: false, isUnlisted: false });
        }
    };

    if (loading) return <Loader />;
    if (!showfolio) return <div>Error loading showfolio</div>;

    // Handlanje polja
    const handleChange = (field, value) => setShowfolio({ ...showfolio, [field]: value });

    // Dodavanje linka
    const addLink = () => setShowfolio({ ...showfolio, links: [...(showfolio.links || []), { label: "", url: "" }] });

    // Spremi promjene
    const handleSave = async (e) => {
        e.preventDefault();
        await saveShowfolio(showfolio);
        setMsg("Saved!");
        setTimeout(() => setMsg(""), 2000);
    };

    return (
        <form className="showfolio-editor" onSubmit={handleSave}>
            <h1>Showfolio Settings</h1>
            <div>
                <label>Privacy:</label>
                <label>
                    <input
                        type="radio"
                        checked={privacy === "public"}
                        onChange={() => handlePrivacyChange("public")}
                    /> Public
                </label>
                <label>
                    <input
                        type="radio"
                        checked={privacy === "unlisted"}
                        onChange={() => handlePrivacyChange("unlisted")}
                    /> Unlisted (with link)
                </label>
                <label>
                    <input
                        type="radio"
                        checked={privacy === "private"}
                        onChange={() => handlePrivacyChange("private")}
                    /> Private
                </label>
            </div>
            <div>
                <label>Primary Color:</label>
                <input
                    type="color"
                    value={showfolio.primaryColor}
                    onChange={e => handleChange("primaryColor", e.target.value)}
                />
            </div>
            <div>
                <label>Links:</label>
                {(showfolio.links || []).map((link, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                            value={link.label}
                            onChange={e => {
                                const links = [...showfolio.links];
                                links[i].label = e.target.value;
                                handleChange("links", links);
                            }}
                            placeholder="Label"
                            style={{ flex: 1 }}
                        />
                        <input
                            value={link.url}
                            onChange={e => {
                                const links = [...showfolio.links];
                                links[i].url = e.target.value;
                                handleChange("links", links);
                            }}
                            placeholder="URL"
                            style={{ flex: 2 }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const links = showfolio.links.filter((_, idx) => idx !== i);
                                handleChange("links", links);
                            }}
                            style={{
                                background: "#fee2e2",
                                color: "#b91c1c",
                                border: "none",
                                borderRadius: 6,
                                padding: "0 10px",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addLink} style={{ marginTop: 8 }}>Add Link</button>
            </div>
            {/* Dodaj UI za sekcije (about, experience, itd.) po istom principu */}
            <button type="submit" className="btn-primary" style={{ marginTop: 18 }}>Save</button>
            {msg && <div className="form-message success">{msg}</div>}
        </form>
    );
}
