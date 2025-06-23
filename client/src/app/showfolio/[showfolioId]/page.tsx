// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import { useParams } from "next/navigation";
import { usePublicShowfolio } from "@/hooks/usePublicShowfolio";
import Loader from "@/components/Loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

// Helper za dohvat sekcije po tipu
function getSection(sections, type) {
    return sections.find(s => s.type === type);
}

export default function ShowfolioPage() {
    const params = useParams();
    const showfolioId = params?.showfolioId as string;
    const { showfolio, loading } = usePublicShowfolio(showfolioId);

    if (loading) return <Loader />;
    if (!showfolio) return <div>Showfolio not found or private.</div>;

    const style = { "--primary": showfolio.primaryColor || "#6366f1" } as React.CSSProperties;

    // Dohvati sekcije
    const sections = showfolio.sections || [];

    // Kontakt sekcija
    const contactSection = getSection(sections, "contact");
    const aboutSection = getSection(sections, "about");
    const experienceSection = getSection(sections, "experience");
    const educationSection = getSection(sections, "education");
    const projectsSection = getSection(sections, "projects");
    const skillsSection = getSection(sections, "skills");
    const linksSection = getSection(sections, "links");

    return (
        <div className="showfolio-container" style={style}>
            <header className="showfolio-header">
                {/* Ime i prezime */}
                <h1 style={{ color: "var(--primary)" }}>
                    {showfolio.user?.firstName} {showfolio.user?.lastName}
                </h1>
                {/* Kontakt sekcija s fotkom */}
                {contactSection && (
                    <div className="showfolio-contact">
                        {contactSection.content.photoUrl && (
                            <img
                                src={`${API_URL}${contactSection.content.photoUrl}`}
                                alt="Profile"
                                className="showfolio-contact-photo"
                                style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }}
                            />
                        )}
                        <div className="showfolio-contact-details">
                            {contactSection.content.email && (
                                <div>
                                    <strong>Email:</strong>{" "}
                                    <a href={`mailto:${contactSection.content.email}`}>{contactSection.content.email}</a>
                                </div>
                            )}
                            {contactSection.content.phone && (
                                <div>
                                    <strong>Phone:</strong>{" "}
                                    <a href={`tel:${contactSection.content.phone}`}>{contactSection.content.phone}</a>
                                </div>
                            )}
                            {contactSection.content.address && (
                                <div>
                                    <strong>Address:</strong> {contactSection.content.address}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Linkovi (iz sekcije ili iz root objekta radi kompatibilnosti) */}
                <div className="showfolio-links">
                    {(linksSection?.content || showfolio.links || []).map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    ))}
                </div>
            </header>

            {/* About sekcija */}
            {aboutSection && (
                <div className="showfolio-section">
                    <h2>About</h2>
                    <p>{aboutSection.content}</p>
                </div>
            )}

            {/* Experience sekcija */}
            {experienceSection && (
                <div className="showfolio-section">
                    <h2>Experience</h2>
                    {Array.isArray(experienceSection.content) && experienceSection.content.length > 0 ? (
                        <ul>
                            {experienceSection.content.map((exp, i) => (
                                <li key={i}>
                                    <strong>{exp.role}</strong> - {exp.company} ({exp.years})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No experience listed.</p>
                    )}
                </div>
            )}

            {/* Education sekcija */}
            {educationSection && (
                <div className="showfolio-section">
                    <h2>Education</h2>
                    {Array.isArray(educationSection.content) && educationSection.content.length > 0 ? (
                        <ul>
                            {educationSection.content.map((edu, i) => (
                                <li key={i}>
                                    <strong>{edu.school}</strong> — {edu.degree} ({edu.years})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No education listed.</p>
                    )}
                </div>
            )}

            {/* Projects sekcija */}
            {projectsSection && (
                <div className="showfolio-section">
                    <h2>Projects</h2>
                    {Array.isArray(projectsSection.content) && projectsSection.content.length > 0 ? (
                        <ul>
                            {projectsSection.content.map((proj, i) => (
                                <li key={i}>
                                    <strong>{proj.title}</strong>
                                    {proj.url && <> — <a href={proj.url} target="_blank" rel="noopener noreferrer">{proj.url}</a></>}
                                    <br />
                                    {proj.description}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No projects listed.</p>
                    )}
                </div>
            )}

            {/* Skills sekcija */}
            {skillsSection && (
                <div className="showfolio-section">
                    <h2>Skills</h2>
                    {Array.isArray(skillsSection.content) && skillsSection.content.length > 0 ? (
                        <ul>
                            {skillsSection.content.map((skill, i) => (
                                <li key={i}>{skill}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No skills listed.</p>
                    )}
                </div>
            )}
        </div>
    );
}
