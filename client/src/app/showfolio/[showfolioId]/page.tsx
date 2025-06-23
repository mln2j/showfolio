// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import { useParams } from "next/navigation";
import { usePublicShowfolio } from "@/hooks/usePublicShowfolio";

export default function ShowfolioPage() {
    const params = useParams();
    const showfolioId = params?.showfolioId as string;
    const { showfolio, loading } = usePublicShowfolio(showfolioId);


    if (loading) return <div>Loading...</div>;
    if (!showfolio) return <div>Showfolio not found or private.</div>;

    const style = { "--primary": showfolio.primaryColor || "#6366f1" } as React.CSSProperties;

    return (
        <div className="showfolio-container" style={style}>
            <header className="showfolio-header">
                <h1 style={{ color: "var(--primary)" }}>
                    {showfolio.user?.firstName} {showfolio.user?.lastName}
                </h1>
                <div className="showfolio-links">
                    {(showfolio.links || []).map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    ))}
                </div>
            </header>
            {showfolio.sections?.map((section, idx) => (
                <div className="showfolio-section" key={idx}>
                    <h2>{section.title}</h2>
                    {section.type === "about" && <p>{section.content}</p>}
                    {section.type === "experience" && (
                        <ul>
                            {(section.content || []).map((exp: never, i: number) => (
                                <li key={i}><strong>{exp.role}</strong> - {exp.company} ({exp.years})</li>
                            ))}
                        </ul>
                    )}
                    {/* Dodaj ostale sekcije po potrebi */}
                </div>
            ))}
            <button className="btn-print" onClick={() => window.print()}>Print</button>
        </div>
    );
}
