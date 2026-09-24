function Metric({ value, label }) {
    return (
        <article className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="text-[clamp(1.1rem,3.5vw,1.5rem)] font-bold">{value}</span>
            <span className="stat-label">{label}</span>
        </article>
    );
}

export default function PerformanceCard({ pageLoadTime, githubResponseTime, mapResponseTime }) {
    return (
        <section className="glass-subcard flex justify-evenly gap-2 px-1.5 py-3.5 sm:gap-4 sm:p-4" aria-label="Performances">
            <Metric value={pageLoadTime} label="Chargement de la page" />
            <Metric value={githubResponseTime} label="Réponse API GitHub" />
            <Metric value={mapResponseTime} label="Chargement carte monde" />
        </section>
    );
}
