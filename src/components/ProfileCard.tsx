import type { GitHubState } from '../types';

function getProfileTexts(github: GitHubState) {
    if (github.status === 'loading') {
        return {
            name: 'Chargement du profil...',
            bio: 'Chargement de la biographie...',
            company: "Chargement de l'entreprise..."
        };
    }

    if (github.status === 'error') {
        return {
            name: 'Profil GitHub temporairement indisponible',
            bio: 'Les informations seront disponibles dès que la connexion sera rétablie.',
            company: ''
        };
    }

    const { profile } = github;
    return {
        name: profile.login || 'Aurélien Georges',
        bio: profile.bio || 'Développeur Full-Stack',
        company: profile.company || 'Negolux Concept usine'
    };
}

export default function ProfileCard({ github }: { github: GitHubState }) {
    const { name, bio, company } = getProfileTexts(github);

    return (
        <section className="glass-subcard p-6 text-center" aria-label="Profil">
            <p className="m-0 text-[clamp(1.35rem,4vw,1.8rem)] font-bold">{name}</p>
            <p className="mt-2 text-ink/80">{bio}</p>
            {company && <p className="mt-2 text-ink/80">{company}</p>}
        </section>
    );
}
