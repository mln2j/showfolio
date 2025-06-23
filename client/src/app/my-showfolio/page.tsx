// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import { useShowfolio } from "@/hooks/useShowfolio";
import { useState } from "react";

export default function MyShowfolioPage() {
    const { showfolio, setShowfolio, saveShowfolio, loading } = useShowfolio();
    const [msg, setMsg] = useState("");

    if (loading) return <div>Loading...</div>;
    if (!showfolio) return <div>Error loading showfolio</div>;

    // Handlanje polja
    const handleChange = (field, value) => setShowfolio({ ...showfolio, [field]: value });

    // Dodavanje linka
    const addLink = () => setShowfolio({ ...showfolio, links: [...(showfolio.links || []), { label: "", url: "" }] });

    // Dodavanje sekcije
    const addSection = (type) => setShowfolio({
        ...showfolio,
        sections: [...(showfolio.sections || []), { type, title: "", content: "" }]
    });

    // Spremi promjene
    const handleSave = async (e) => {
        e.preventDefault();
        await saveShowfolio(showfolio);
        setMsg("Saved!");
    };

    return (
        <form className="showfolio-editor" onSubmit={handleSave}>
            <h1>Edit Your Showfolio</h1>
            <div>
                <label>Privacy:</label>
                <label><input type="radio" checked={showfolio.isPublic} onChange={() => handleChange("isPublic", true)} /> Public</label>
                <label><input type="radio" checked={showfolio.isUnlisted} onChange={() => handleChange("isUnlisted", true)} /> Unlisted (with link)</label>
                <label><input type="radio" checked={!showfolio.isPublic && !showfolio.isUnlisted} onChange={() => { handleChange("isPublic", false); handleChange("isUnlisted", false); }} /> Private</label>
            </div>
            <div>
                <label>Primary Color:</label>
                <input type="color" value={showfolio.primaryColor} onChange={e => handleChange("primaryColor", e.target.value)} />
            </div>
            <div>
                <label>Links:</label>
                {(showfolio.links || []).map((link, i) => (
                    <div key={i}>
                        <input value={link.label} onChange={e => {
                            const links = [...showfolio.links];
                            links[i].label = e.target.value;
                            handleChange("links", links);
                        }} placeholder="Label" />
                        <input value={link.url} onChange={e => {
                            const links = [...showfolio.links];
                            links[i].url = e.target.value;
                            handleChange("links", links);
                        }} placeholder="URL" />
                        <button type="button" onClick={() => {
                            const links = showfolio.links.filter((_, idx) => idx !== i);
                            handleChange("links", links);
                        }}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addLink}>Add Link</button>
            </div>
            <div>
                <label>Sections:</label>
                {(showfolio.sections || []).map((section, i) => (
                    <div key={i} className="showfolio-section-edit">
                        <select value={section.type} onChange={e => {
                            const sections = [...showfolio.sections];
                            sections[i].type = e.target.value;
                            handleChange("sections", sections);
                        }}>
                            <option value="about">About</option>
                            <option value="experience">Experience</option>
                            <option value="education">Education</option>
                            <option value="projects">Projects</option>
                            <option value="skills">Skills</option>
                            <option value="links">Links</option>
                        </select>
                        <input value={section.title} onChange={e => {
                            const sections = [...showfolio.sections];
                            sections[i].title = e.target.value;
                            handleChange("sections", sections);
                        }} placeholder="Section title" />
                        <textarea value={section.content} onChange={e => {
                            const sections = [...showfolio.sections];
                            sections[i].content = e.target.value;
                            handleChange("sections", sections);
                        }} placeholder="Section content" />
                        <button type="button" onClick={() => {
                            const sections = showfolio.sections.filter((_, idx) => idx !== i);
                            handleChange("sections", sections);
                        }}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addSection("about")}>Add Section</button>
            </div>
            <button type="submit">Save</button>
            {msg && <div>{msg}</div>}
        </form>
    );
}
