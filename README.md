# Raphaël Picard · portfolio

Portfolio de Raphaël Picard, Senior AI Engineer & Responsable IA à Lyon : [www.raphaelpicard.com](https://www.raphaelpicard.com).

Le site existe en deux versions, qui lisent le même contenu.

- **`/` : le portfolio est un jeu 3D.** Le Val des Origines (fantasy peinte) raconte la carrière, un portail mène au Nexus (ville néon façon Hong Kong) où vivent les agents IA en production. Quêtes, personnages qui parlent, bugs à corriger (chaque bug est une vraie panne d'IA avec sa parade), carte, hauts faits, cinéma qui projette le résumé vidéo, carte de fin. Deux héros : le chevalier (3ᵉ personne) et le Runner (vue FPS). Jouable au clavier, à la souris et au tactile (téléphone en paysage).
- **`/portfolio` : la version classique**, une page lisible en deux minutes pour les recruteurs pressés.
- **`/cv`** génère le CV (non indexé), imprimé en PDF dans `public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf`.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- React Three Fiber 9, drei 10, three.js, postprocessing (bloom, tone mapping ACES)
- motion et Lenis pour la version classique
- Vitest (tests unitaires) et Playwright (tests de bout en bout)
- Déploiement sur Vercel, avec Vercel Analytics et Speed Insights

## Structure

| Dossier | Rôle |
| --- | --- |
| `content/` | Tous les textes du site : `profile.ts` (profil, chiffres, expertise), `work.ts` (expériences, projets, diplômes), `cv.ts` (détails propres au CV) |
| `lib/` | Logique du jeu sans rendu : quêtes, bugs, hauts faits, sauvegarde (`game-store.ts`), monde et collisions (`world.ts`), musique et voix |
| `components/three/world/` | Le monde 3D : val, Nexus, héros, bugs, portails, cinéma, arme FPS |
| `components/game/` | L'interface du jeu : écran d'accueil, quêtes, menu, carte, fiches de bug, carte de fin |
| `components/sections/` | Les sections de la version classique |
| `components/ui/` | Éléments partagés, dont la fenêtre « Raphaël en 30 secondes » |
| `app/` | Routes, métadonnées SEO, données structurées, sitemap, robots, image Open Graph |
| `public/` | Modèles 3D compressés, textures, musiques, voix, vidéo, CV |
| `scripts/` | Génération du CV, des voix, de la vidéo et des bras FPS |

Pour modifier un texte, il suffit presque toujours d'éditer `content/`. Les chiffres viennent de faits vérifiés : aucun n'est arrondi ni estimé.

## Démarrer

Node 24 est recommandé.

```sh
npm install
npm run dev          # http://localhost:3000
```

| Commande | Effet |
| --- | --- |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires (quêtes, collisions, sauvegarde, cohérence du contenu) |
| `npm run test:e2e` | Tests Playwright (jeu sur ordinateur, téléphone, tablette, version classique) |

En développement, le jeu expose des crochets de test (`window.__game`, `window.__player`…) qui n'existent pas en production.

## Régénérer les contenus produits

- **CV** : avec le serveur de dev lancé, `node scripts/cv/print.mjs` imprime `/cv` en PDF balisé (polices incorporées, métadonnées, lisible par les logiciels de tri des recruteurs).
- **Voix des quêtes** : `scripts/voices/generate.py` génère les répliques hors ligne avec des moteurs libres (Piper et Kokoro). Voir `scripts/voices/README.md`.
- **Vidéo « Raphaël en 30 secondes »** : filmée dans le jeu avec Playwright, montée avec Remotion. Voir `scripts/video/README.md`.
- **Bras de la vue FPS** : pipeline de pose et de cuisson dans `scripts/fps-arms/`.

## Déploiement

Vercel déploie la branche `master` en production. Une seule variable d'environnement :

| Variable | Usage |
| --- | --- |
| `WEB3_FORMS_API_KEY` | Clé Web3Forms du formulaire de contact. Sans elle, le formulaire invite à écrire par e-mail. |

Le domaine nu `raphaelpicard.com` redirige vers `www.raphaelpicard.com`, et l'ancienne adresse du CV (`/cv-RaphaelPICARD-IA.pdf`) redirige vers la nouvelle.

## Crédits

Tous les modèles, musiques et voix sont gratuits et sous licence libre (CC0, CC BY, CC BY-SA, Apache-2.0). La liste complète, avec les auteurs, est dans le menu du jeu (onglet Crédits) et en pied de page de la version classique.

## Contact

[raphaelpicard@outlook.fr](mailto:raphaelpicard@outlook.fr) · [LinkedIn](https://www.linkedin.com/in/raphael-picard/) · [GitHub](https://github.com/PicardRaphael)
