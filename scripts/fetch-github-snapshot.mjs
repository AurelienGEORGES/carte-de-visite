// Récupère les données GitHub au moment du build et les écrit dans public/github.json.
// La page les affiche immédiatement, avant la réponse de l'API.
// En cas d'échec, le build continue sans instantané.
import { writeFile } from 'node:fs/promises';

const USERNAME = 'AurelienGEORGES';
const API_BASE_URL = `https://api.github.com/users/${USERNAME}`;
const OUTPUT = new URL('../public/github.json', import.meta.url);

const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function get(url) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`${url} : ${response.status}`);
    }
    return response;
}

try {
    const [profileResponse, repositoriesResponse, starredResponse] = await Promise.all([
        get(API_BASE_URL),
        get(`${API_BASE_URL}/repos?sort=updated&per_page=10`),
        get(`${API_BASE_URL}/starred?per_page=1`)
    ]);
    const profile = await profileResponse.json();
    const repositories = await repositoriesResponse.json();
    const starred = await starredResponse.json();
    const lastPage = starredResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/);

    const snapshot = {
        profile: {
            login: profile.login,
            bio: profile.bio,
            company: profile.company,
            followers: profile.followers,
            following: profile.following
        },
        repositories: repositories.map(({ id, name, description, html_url }) => ({ id, name, description, html_url })),
        stars: lastPage ? Number(lastPage[1]) : starred.length
    };

    await writeFile(OUTPUT, JSON.stringify(snapshot));
    console.log('Instantané GitHub écrit dans public/github.json');
} catch (error) {
    console.warn(`Instantané GitHub non généré (${error.message}), le site chargera les données en direct.`);
}
