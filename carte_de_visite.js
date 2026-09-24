const USERNAME = 'AurelienGEORGES';
const API_BASE_URL = `https://api.github.com/users/${USERNAME}`;

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);
    if (element) {
        element.textContent = value;
    }
}

function formatDuration(duration) {
    return `${Math.round(duration)} ms`;
}

function ensureSuccess(response) {
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response;
}

function renderRepositories(repositories) {
    const container = getElement('github-unified-list');
    if (!container) {
        return;
    }

    container.replaceChildren();

    repositories.forEach(({ name, description }) => {
        const item = document.createElement('li');
        const repositoryName = document.createElement('span');
        const repositoryDescription = document.createElement('span');

        item.className = 'repository-item';
        repositoryName.className = 'repository-name';
        repositoryDescription.className = 'repository-description';
        repositoryName.textContent = name;
        repositoryDescription.textContent = description || 'Dépôt public';

        item.append(repositoryName, repositoryDescription);
        container.append(item);
    });
}

function initializeMap() {
    const mapContainer = getElement('world-map');
    if (!mapContainer) {
        return;
    }

    if (!window.L) {
        mapContainer.textContent = 'La carte est temporairement indisponible.';
        return;
    }

    const worldZoom = 1.5;
    const toulouse = [43.6047, 1.4442];
    const map = window.L.map(mapContainer, {
        boxZoom: false,
        doubleClickZoom: false,
        dragging: false,
        keyboard: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1,
        minZoom: worldZoom,
        maxZoom: worldZoom,
        scrollWheelZoom: false,
        touchZoom: false,
        worldCopyJump: false,
        zoomControl: false,
        zoomSnap: 0
    }).setView([20, 0], worldZoom);

    const mapRequestStartedAt = performance.now();
    const mapTiles = window.L.tileLayer(
    'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=lx9QLhuAyx3LhtoQz1LB',
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors &copy; MapTiler',
        bounds: [[-85, -180], [85, 180]],
        noWrap: true,
        tileSize: 512,
        zoomOffset: -1
    }
    );

    mapTiles.once('load', () => {
        setText('map-api-response-time', formatDuration(performance.now() - mapRequestStartedAt));
    });
    mapTiles.once('tileerror', () => {
        setText('map-api-response-time', 'Indisponible');
    });
    mapTiles.addTo(map);

    window.L.marker(toulouse)
        .addTo(map);
}

async function loadGitHubData() {
    try {
        const requestStartedAt = performance.now();
        const [profileResponse, repositoriesResponse, starredResponse] = await Promise.all([
            fetch(API_BASE_URL).then(ensureSuccess),
            fetch(`${API_BASE_URL}/repos?sort=updated_at&per_page=10`).then(ensureSuccess),
            fetch(`${API_BASE_URL}/starred?per_page=1`).then(ensureSuccess)
        ]);
        setText('github-api-response-time', formatDuration(performance.now() - requestStartedAt));

        const [profile, repositories] = await Promise.all([
            profileResponse.json(),
            repositoriesResponse.json()
        ]);
        const lastPage = starredResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/);

        setText('github-followers', profile.followers ?? 0);
        setText('github-following', profile.following ?? 0);
        setText('github-my-stars', lastPage ? lastPage[1] : 0);
        setText('github-login', profile.login || 'Aurélien Georges');
        setText('github-bio', profile.bio || 'Développeur Full-Stack');
        setText('github-entreprise', profile.company || 'Negolux Concept usine');
        renderRepositories(repositories);
    } catch (error) {
        console.error('Impossible de charger les données GitHub :', error);
        setText('github-login', 'Profil GitHub temporairement indisponible');
        setText('github-bio', 'Les informations seront disponibles dès que la connexion sera rétablie.');
        setText('github-entreprise', '');
        setText('github-my-stars', '—');
        setText('github-api-response-time', '—');
    }
}

window.addEventListener('load', () => {
    window.setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadDuration = navigation?.loadEventEnd || performance.now();
        setText('page-load-time', formatDuration(loadDuration));
    }, 0);
});

initializeMap();
loadGitHubData();