import type { GitHubState } from '../types';

interface StatProps {
    value: string | number;
    label: string;
}

function Stat({ value, label }: StatProps) {
    return (
        <article className="flex min-w-20 flex-col items-center gap-1">
            <span className="text-[clamp(1.3rem,4vw,1.7rem)] font-bold">{value}</span>
            <span className="stat-label">{label}</span>
        </article>
    );
}

export default function StatsCard({ github }: { github: GitHubState }) {
    const isSuccess = github.status === 'success';
    const isError = github.status === 'error';

    return (
        <section className="glass-subcard flex justify-evenly px-1.5 py-3.5 sm:p-4" aria-label="Statistiques GitHub">
            <Stat value={isSuccess ? github.profile.followers ?? 0 : '--'} label="Followers" />
            <Stat value={isSuccess ? github.profile.following ?? 0 : '--'} label="Following" />
            <Stat value={isSuccess ? github.stars : isError ? '—' : '--'} label="Stars" />
        </section>
    );
}
