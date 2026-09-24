export default function RepositoriesCard({ github }) {
    const repositories = github.status === 'success' ? github.repositories : [];

    return (
        <section className="glass-subcard p-5" aria-labelledby="repositories-title">
            <h1 id="repositories-title" className="section-title mb-3">Dépôts récents</h1>
            <ol className="m-0 grid list-decimal gap-2 pl-6" aria-live="polite">
                {repositories.map(({ id, name, description, html_url }) => (
                    <li key={id} className="border-b border-white/30 py-2.5 text-ink/90 last:border-b-0">
                        <a href={html_url} target="_blank" rel="noreferrer" className="font-bold hover:underline">
                            {name}
                        </a>
                        <span className="ml-1.5">{description || 'Dépôt public'}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
