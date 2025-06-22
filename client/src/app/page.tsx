import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="homepage">
            <section className="hero">
                <h1>Welcome to Showfolio</h1>
                <p>
                    <b>Showfolio</b> is an easy way to create, edit, and share your professional portfolio or CV online.
                    <br />
                    Discover inspiring profiles from other users or build your own. No registration required to browse!
                </p>
                <div className="cta-buttons">
                    <Link href="/register" className="btn-primary">Sign up</Link>
                    <Link href="/login" className="btn-secondary">Login</Link>
                </div>
            </section>

            {/* (Optional) Example search or featured profiles */}
            {/* <section className="search-section">
        <h2>Explore Public Portfolios</h2>
        <input type="text" placeholder="Search by name, skill, or keyword..." />
        // List of sample public profiles here
      </section> */}
        </main>
    );
}
