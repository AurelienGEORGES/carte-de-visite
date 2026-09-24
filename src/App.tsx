import { useState } from 'react';
import StatsCard from './components/StatsCard';
import ProfileCard from './components/ProfileCard';
import RepositoriesCard from './components/RepositoriesCard';
import PerformanceCard from './components/PerformanceCard';
import MapCard from './components/MapCard';
import { useGitHubData } from './hooks/useGitHubData';
import { usePageLoadTime } from './hooks/usePageLoadTime';
import type { GitHubState } from './types';

function getGitHubResponseTime(github: GitHubState): string {
    if (github.status === 'success') {
        return github.responseTime;
    }

    return github.status === 'error' ? '—' : '--';
}

export default function App() {
    const github = useGitHubData();
    const pageLoadTime = usePageLoadTime();
    const [mapResponseTime, setMapResponseTime] = useState('--');

    return (
        <main className="flex min-h-screen w-full items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
            <article
                className="glass-card flex w-full max-w-190 flex-col gap-3 p-3 sm:gap-4 sm:p-[clamp(1rem,3vw,2rem)]"
                aria-label="Carte de visite GitHub d'Aurélien Georges"
            >
                <StatsCard github={github} />
                <ProfileCard github={github} />
                <RepositoriesCard github={github} />
                <PerformanceCard
                    pageLoadTime={pageLoadTime}
                    githubResponseTime={getGitHubResponseTime(github)}
                    mapResponseTime={mapResponseTime}
                />
                <MapCard onTilesLoaded={setMapResponseTime} />
            </article>
        </main>
    );
}
