# Carte de visite

Carte de visite en glassmorphism : profil et dépôts via l'API GitHub, carte statique MapTiler.

Stack : React 19 + TypeScript, Tailwind CSS 4, Vite.

```bash
npm install
npm run dev      # serveur de développement
npm run build    # vérification TypeScript + build de production dans dist/
npm run typecheck # vérification TypeScript seule
npm run preview  # prévisualiser le build
npm run snapshot # (optionnel) instantané des données GitHub dans public/github.json
```

## Déploiement

Chaque push sur `main` (et chaque nuit, pour rafraîchir les données GitHub) construit le site et le publie sur GitHub Pages via le workflow `.github/workflows/deploy.yml`.
Dans les réglages du dépôt (Settings → Pages), la source doit être « GitHub Actions ».
