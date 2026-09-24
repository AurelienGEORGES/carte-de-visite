export interface GitHubProfile {
    login: string;
    bio: string | null;
    company: string | null;
    followers: number;
    following: number;
}

export interface GitHubRepository {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
}

export interface GitHubData {
    profile: GitHubProfile;
    repositories: GitHubRepository[];
    stars: number;
}

export type GitHubState =
    | { status: 'loading' }
    | { status: 'error' }
    | ({ status: 'success' } & GitHubData);
