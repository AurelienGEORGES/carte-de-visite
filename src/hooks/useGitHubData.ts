import { useEffect, useState } from 'react';
import { formatDuration } from '../utils';
import type { GitHubProfile, GitHubRepository, GitHubState } from '../types';

const USERNAME = 'AurelienGEORGES';
const API_BASE_URL = `https://api.github.com/users/${USERNAME}`;

function ensureSuccess(response: Response): Response {
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response;
}

export function useGitHubData(): GitHubState {
    const [state, setState] = useState<GitHubState>({ status: 'loading' });

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function load() {
            try {
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

                setState({
                    status: 'success',
                    responseTime,
                    profile,
                    repositories,
                    stars: lastPage ? Number(lastPage[1]) : starred.length
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                console.error('Impossible de charger les données GitHub :', error);
                setState({ status: 'error' });
            }
        }

        load();

        return () => controller.abort();
    }, []);

    return state;
}
