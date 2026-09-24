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

async function loadGitHubData() {
    try {
        const [profileResponse, repositoriesResponse, starredResponse] = await Promise.all([
            fetch(API_BASE_URL).then(ensureSuccess),
            fetch(`${API_BASE_URL}/repos?sort=updated_at&per_page=10`).then(ensureSuccess),
            fetch(`${API_BASE_URL}/starred?per_page=1`).then(ensureSuccess)
        ]);

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
    }
}

loadGitHubData();