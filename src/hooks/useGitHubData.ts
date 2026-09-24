import { useEffect, useState } from 'react';
import { formatDuration } from '../utils';
import type { GitHubData, GitHubProfile, GitHubRepository, GitHubState } from '../types';

const USERNAME = 'AurelienGEORGES';
const API_BASE_URL = `https://api.github.com/users/${USERNAME}`;
// Instantané généré au build par scripts/fetch-github-snapshot.mjs (absent en développement).
const SNAPSHOT_URL = `${import.meta.env.BASE_URL}github.json`;

function ensureSuccess(response: Response): Response {
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

async function fetchSnapshot(signal: AbortSignal): Promise<GitHubData | null> {
    try {
        const response = await fetch(SNAPSHOT_URL, { signal });
        return response.ok ? ((await response.json()) as GitHubData) : null;
    } catch {
        return null;
    }
}

async function fetchLive(signal: AbortSignal): Promise<{ data: GitHubData; responseTime: string }> {
    const requestStartedAt = performance.now();
    const [profileResponse, repositoriesResponse, starredResponse] = await Promise.all([
        fetch(API_BASE_URL, { signal }).then(ensureSuccess),
        fetch(`${API_BASE_URL}/repos?sort=updated&per_page=10`, { signal }).then(ensureSuccess),
        fetch(`${API_BASE_URL}/starred?per_page=1`, { signal }).then(ensureSuccess)
    ]);
    const responseTime = formatDuration(performance.now() - requestStartedAt);

    const [profile, repositories, starred] = (await Promise.all([
        profileResponse.json(),
        repositoriesResponse.json(),
        starredResponse.json()
    ])) as [GitHubProfile, GitHubRepository[], unknown[]];
    const lastPage = starredResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/);

    return {
        data: { profile, repositories, stars: lastPage ? Number(lastPage[1]) : starred.length },
        responseTime
    };
}

/**
 * Affiche d'abord l'instantané du build (même origine, quasi instantané),
 * puis le remplace par les données de l'API GitHub dès qu'elles arrivent.
 * Si l'API échoue (limite de requêtes, réseau), l'instantané reste affiché.
 */
export function useGitHubData(): { github: GitHubState; responseTime: string } {
    const [data, setData] = useState<GitHubData | null>(null);
    const [liveStatus, setLiveStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [responseTime, setResponseTime] = useState('--');

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        let hasLiveData = false;

        fetchSnapshot(signal).then((snapshot) => {
            if (snapshot && !hasLiveData && !signal.aborted) {
                setData(snapshot);
            }
        });

        fetchLive(signal)
            .then((live) => {
                hasLiveData = true;
                setData(live.data);
                setResponseTime(live.responseTime);
                setLiveStatus('success');
            })
            .catch((error: unknown) => {
                if (isAbortError(error)) {
                    return;
                }
                console.error('Impossible de charger les données GitHub :', error);
                setResponseTime('—');
                setLiveStatus('error');
            });

        return () => controller.abort();
    }, []);

    let github: GitHubState;
    if (data) {
        github = { status: 'success', ...data };
    } else {
        github = liveStatus === 'error' ? { status: 'error' } : { status: 'loading' };
    }

    return { github, responseTime };
}
