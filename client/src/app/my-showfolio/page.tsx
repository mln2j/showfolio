// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import { useShowfolio } from "@/hooks/useShowfolio";
import { useState, useRef, useEffect } from "react";
import Loader from "@/components/Loader";

// Helperi za sekcije
const SECTION_ORDER = [
    "about",
    "contact",
    "experience",
    "education",
    "projects",
    "skills",
    "links"
];
const SECTION_LABELS = {
    projects: "Projects",
    links: "Links",
    skills: "Skills",
    education: "Education",
    experience: "Experience",
    about: "About",
    contact: "Contact"
};

const SECTION_SINGULAR = {
    projects: "Project",
    links: "Link",
    skills: "Skill",
    education: "Education",
    experience: "Experience"
};

const DEFAULT_SECTIONS = [
    { type: "about", content: "" },
    { type: "contact", content: { email: "", phone: "", address: "", photoUrl: "" } },
    { type: "experience", content: [] },
    { type: "education", content: [] },
    { type: "projects", content: [] },
    { type: "skills", content: [] },
    { type: "links", content: [] }
];

function getSection(sections, type) {
    return sections.find(s => s.type === type)
        || DEFAULT_SECTIONS.find(s => s.type === type);
}
function setSection(sections, type, content) {
    return sections.map(s => s.type === type ? { ...s, content } : s);
}

export default function MyShowfolioPage() {
    const { showfolio, setShowfolio, saveShowfolio, loading } = useShowfolio();
    const [msg, setMsg] = useState("");
    const fileInputRef = useRef(null);

    // Inicijalizacija sekcija ako ih nema
    useEffect(() => {
        if (showfolio && (!showfolio.sections || showfolio.sections.length === 0)) {
            setShowfolio({ ...showfolio, sections: DEFAULT_SECTIONS });
        }
    }, [showfolio, setShowfolio]);

    if (loading) return <Loader />;
    if (!showfolio) return <div>Error loading showfolio</div>;
    if (!showfolio.sections || showfolio.sections.length === 0) return null;

    // Handlanje polja
    const updateSection = (type, content) => setShowfolio({
        ...showfolio,
        sections: setSection(showfolio.sections, type, content)
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

    async function uploadPhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch(`${API_URL}/api/showfolio/photo`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to upload photo');
        }
        const data = await res.json();
        return data.photoUrl;
    }


    const handlePhotoChange = async (file) => {
        try {
            const url = await uploadPhoto(file);
            const contact = getSection(showfolio.sections, "contact");
            updateSection("contact", { ...contact.content, photoUrl: url });
            setMsg("Photo uploaded!");
            setTimeout(() => setMsg(""), 2000);
        } catch (err) {
            setMsg("Error uploading photo");
        }
    };

    // Spremi promjene
    const handleSave = async (e) => {
        e.preventDefault();
        await saveShowfolio(showfolio);
        setMsg("Saved!");
        setTimeout(() => setMsg(""), 2000);
    };

    return (
        <form className="showfolio-editor" onSubmit={handleSave}>
            <h1>Edit Your Showfolio</h1>

            {/* Visibility i boja */}
            <div className={"controls"}>
                <div className={"visibility-control"}>
                    <label>Visibility:</label>
                    <select
                        value={showfolio.visibility || "public"}
                        onChange={e => setShowfolio({ ...showfolio, visibility: e.target.value })}
                        style={{ padding: "6px 12px", borderRadius: 8, width: "100%" }}
                    >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted (with link)</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div className={"color-control"}>
                    <label>Primary Color:</label>
                    <input
                        type="color"
                        value={showfolio.primaryColor}
                        onChange={e => setShowfolio({ ...showfolio, primaryColor: e.target.value })}
                    />
                </div>
            </div>

            {/* Sekcije */}
            {SECTION_ORDER.map(type => {
                const section = getSection(showfolio.sections, type);
                if (type === "about") {
                    return (
                        <SectionCard key={type} title={SECTION_LABELS[type]}>
                            <textarea
                                value={section.content}
                                onChange={e => updateSection(type, e.target.value)}
                                placeholder="Write something about yourself..."
                            />
                        </SectionCard>
                    );
                }
                if (type === "contact") {
                    return (
                        <SectionCard key={type} title={SECTION_LABELS[type]}>
                            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                                <div className="photo-upload" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
                                    {section.content.photoUrl ? (
                                        <img
                                            src={section.content.photoUrl ? `${API_URL}${section.content.photoUrl}` : ""}
                                            alt="Profile"
                                            className="photo-preview"
                                        />
                                        ) : (
                                        <div className="photo-placeholder">Upload photo</div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        ref={fileInputRef}
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) handlePhotoChange(e.target.files[0]);
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="email" value={section.content.email} onChange={e => updateSection(type, { ...section.content, email: e.target.value })} placeholder="Email" />
                                    <input type="text" value={section.content.phone} onChange={e => updateSection(type, { ...section.content, phone: e.target.value })} placeholder="Phone" />
                                    <input type="text" value={section.content.address} onChange={e => updateSection(type, { ...section.content, address: e.target.value })} placeholder="Address" />
                                </div>
                            </div>
                        </SectionCard>
                    );
                }
                if (type === "experience" || type === "education" || type === "projects") {
                    const isExperience = type === "experience";
                    const isEducation = type === "education";
                    const isProjects = type === "projects";
                    return (
                        <SectionCard key={type} title={SECTION_LABELS[type]}>
                            {section.content.map((item, i) => (
                                <div key={i} className="item-edit">
                                    {isExperience && (
                                        <>
                                            <input value={item.role} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].role = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Role" />
                                            <input value={item.company} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].company = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Company" />
                                            <input value={item.years} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].years = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Years (e.g. 2022-2025)" />
                                        </>
                                    )}
                                    {isEducation && (
                                        <>
                                            <input value={item.school} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].school = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="School" />
                                            <input value={item.degree} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].degree = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Degree" />
                                            <input value={item.years} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].years = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Years" />
                                        </>
                                    )}
                                    {isProjects && (
                                        <>
                                            <input value={item.title} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].title = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Project title" />
                                            <input value={item.description} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].description = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="Description" />
                                            <input value={item.url} onChange={e => {
                                                const arr = [...section.content];
                                                arr[i].url = e.target.value;
                                                updateSection(type, arr);
                                            }} placeholder="URL" />
                                        </>
                                    )}
                                    <button type="button" onClick={() => {
                                        const arr = section.content.filter((_, idx) => idx !== i);
                                        updateSection(type, arr);
                                    }}>Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                if (isExperience) updateSection(type, [...section.content, { role: "", company: "", years: "" }]);
                                if (isEducation) updateSection(type, [...section.content, { school: "", degree: "", years: "" }]);
                                if (isProjects) updateSection(type, [...section.content, { title: "", description: "", url: "" }]);
                            }}>
                                Add {SECTION_SINGULAR[type]}
                            </button>
                        </SectionCard>
                    );
                }
                if (type === "skills") {
                    return (
                        <SectionCard key={type} title={SECTION_LABELS[type]}>
                            {section.content.map((skill, i) => (
                                <div key={i} className="item-edit">
                                    <input value={skill} onChange={e => {
                                        const arr = [...section.content];
                                        arr[i] = e.target.value;
                                        updateSection(type, arr);
                                    }} placeholder="Skill" />
                                    <button type="button" onClick={() => {
                                        const arr = section.content.filter((_, idx) => idx !== i);
                                        updateSection(type, arr);
                                    }}>Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => updateSection(type, [...section.content, ""])}>Add Skill</button>
                        </SectionCard>
                    );
                }
                if (type === "links") {
                    return (
                        <SectionCard key={type} title={SECTION_LABELS[type]}>
                            {section.content.map((link, i) => (
                                <div key={i} className="item-edit">
                                    <input value={link.label} onChange={e => {
                                        const arr = [...section.content];
                                        arr[i].label = e.target.value;
                                        updateSection(type, arr);
                                    }} placeholder="Label" />
                                    <input value={link.url} onChange={e => {
                                        const arr = [...section.content];
                                        arr[i].url = e.target.value;
                                        updateSection(type, arr);
                                    }} placeholder="URL" />
                                    <button type="button" onClick={() => {
                                        const arr = section.content.filter((_, idx) => idx !== i);
                                        updateSection(type, arr);
                                    }}>Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => updateSection(type, [...section.content, { label: "", url: "" }])}>Add Link</button>
                        </SectionCard>
                    );
                }
                return null;
            })}
            <button type="submit" className="btn-primary" style={{ marginTop: 18 }}>Save</button>
            {msg && <div className="form-message success">{msg}</div>}
        </form>
    );
}

// Helper za sekciju
function SectionCard({ title, children }) {
    return (
        <div className="showfolio-section-edit" style={{ marginBottom: 24 }}>
            <h2 style={{ marginBottom: 10, fontWeight: 600 }}>{title}</h2>
            {children}
        </div>
    );
}
