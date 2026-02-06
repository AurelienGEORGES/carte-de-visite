const USERNAME = 'AurelienGEORGES';

async function fetchUnifiedData() {
    try {
        const [reposResp, eventsResp] = await Promise.all([
            fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated_at&per_page=10`),
            fetch(`https://api.github.com/users/${USERNAME}/events/public`)
        ]);
        
        // SÉCURITÉ : Si GitHub bloque (403), on s'arrête proprement
        if (reposResp.status === 403) {
            console.error("Quota GitHub dépassé. Réessayez dans une heure.");
            return;
        }

        const repos = await reposResp.json();
        const events = await eventsResp.json();
        const container = document.getElementById('github-unified-list');
        if (!container) return;
        container.innerHTML = '';

        repos.forEach(repo => {
            const lastEvent = events.find(e => e.repo.name.includes(repo.name));
            let activityMessage = repo.description || "Dépôt public";

            if (lastEvent && lastEvent.type === "PushEvent" && lastEvent.payload.commits) {
                activityMessage = lastEvent.payload.commits[0].message;
            }

            const date = new Date(repo.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
            const miseAJour = new Date(repo.pushed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' }); 
            const mainLang = repo.language || 'Code';

            container.innerHTML += `
                <tr class="luxury-row">
                    <td class="item-repo-name">${repo.name}</td>
                    <td><span class="badge-lang">${mainLang}</span></td>
                    <td class="item-detail-cell">${activityMessage}</td>
                    <td class="item-date-cell">${date}</td>
                    <td class="item-date-cell">${miseAJour}</td>
                </tr>`;
        });
    } catch (e) { console.error("Erreur Unified Data:", e); }
}

async function fetchGitHubProfile() {
    try {
        const userResp = await fetch(`https://api.github.com/users/${USERNAME}`);
        if (userResp.status === 403) return;
        
        const userData = await userResp.json();
        console.log("Profil GitHub:", userData);
        document.getElementById('github-followers').textContent = userData.followers || 0;
        document.getElementById('github-following').textContent = userData.following || 0;
        document.getElementById('github-login').textContent = userData.login || "AurélienGEORGES";
        document.getElementById('github-bio').textContent = userData.bio || "Développeur Full-Stack";
        document.getElementById('github-entreprise').textContent = userData.company || "Negolux Concept usine";
    } catch (e) { console.error("Erreur Profil:", e); }
}

async function fetchMyStarredCount() {
    try {
        const resp = await fetch(`https://api.github.com/users/${USERNAME}/starred?per_page=1`);
        if (resp.status === 403) {
            document.getElementById('github-my-stars').textContent = "??";
            return;
        }
        const link = resp.headers.get('Link');
        let count = 0;
        if (link) {
            const match = link.match(/page=(\d+)>; rel="last"/);
            count = match ? match[1] : 1;
        }
        document.getElementById('github-my-stars').textContent = count;
    } catch (e) { console.error("Erreur Stars:", e); }
}

// Lancement
fetchGitHubProfile();
fetchMyStarredCount();
fetchUnifiedData();