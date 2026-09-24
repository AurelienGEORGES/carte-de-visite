import { useState } from 'react';
import StatsCard from './components/StatsCard.jsx';
import ProfileCard from './components/ProfileCard.jsx';
import RepositoriesCard from './components/RepositoriesCard.jsx';
import PerformanceCard from './components/PerformanceCard.jsx';
import MapCard from './components/MapCard.jsx';
import { useGitHubData } from './hooks/useGitHubData.js';
import { usePageLoadTime } from './hooks/usePageLoadTime.js';

function getGitHubResponseTime(github) {
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
