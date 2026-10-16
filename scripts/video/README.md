# « Raphaël Picard en 30 secondes »

La vidéo de présentation (`public/video/resume-30s.*`) : le jeu filmé image par image, monté sous une typographie cinétique, sur la musique du Nexus.

| Fichier                   | Rôle                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `cues.json`               | **source unique** : découpage (images à 30 i/s, mesures de 72 images = 2,4 s à 100 BPM), textes à l'écran, voix off, sous-titres |
| `shots.mjs`               | les mouvements de caméra de chaque plan (positions en mètres du monde, `lib/world.ts`)                                           |
| `lib.mjs` / `capture.mjs` | Playwright + GPU (ANGLE) : horloge virtuelle, caméra imposée, seul le canvas WebGL est capturé (ni HUD ni DOM)                   |
| `probe.mjs` / `sheet.mjs` | repérages : images fixes des lieux / début-milieu-fin de chaque plan, planches contact                                           |
| `sfx.mjs`                 | whoosh et impact du portail, synthétisés (aucun échantillon)                                                                     |
| `voice.py`                | voix off Kokoro `ff_siwis` (la voix de Raphy·OS, voir `scripts/voices/README.md`)                                                |
| `mix.mjs`                 | mixage : luth du val → portail → « Chillwave Nightdrive » calé sur son premier temps, ducking sous la voix, −15 LUFS             |
| `remotion/`               | le montage (Remotion, React) ; `stills.mjs` en sort des images de contrôle                                                       |
| `vtt.mjs`                 | sous-titres WebVTT depuis `cues.json`                                                                                            |
| `render.mjs`              | enchaîne tout                                                                                                                    |

## Régénérer

Prérequis : `npm run dev` lancé (les crochets de test `window.__game`, `__player`, `__camera` n'existent qu'en dev), un GPU,
un ffmpeg avec les filtres audio (variable `FFMPEG`), Python + `kokoro-onnx` pour la voix (voir `scripts/voices/README.md`).
Remotion et son ffmpeg (libx264) s'installent tout seuls dans `<travail>/remotion`, **jamais** dans le `package.json` du dépôt.

```sh
# dossier de travail hors du dépôt (~1,5 Go d'images et le master ProRes)
export FFMPEG=/c/Program\ Files/XSplit/Broadcaster/ffmpeg.exe
export REMOTION_BROWSER=~/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe
export TTS_PYTHON=../tts-venv/Scripts/python TTS_MODELS=../voice-models
node scripts/video/render.mjs ../video-work                 # tout
node scripts/video/render.mjs ../video-work remotion encode  # seulement remonter et réencoder
```

Étapes : `capture`, `capture-portrait`, `sfx`, `voice`, `mix`, `remotion`, `encode`, `poster`, `vtt`.
Réglages : `KBPS` (débit vidéo MP4 en deux passes, 1550 → ~7,7 Mo), `VP9_KBPS` (1150 → ~5,7 Mo), `KBPS_V` (vertical), `CONCURRENCY` (6).
L'affiche est une composition à part (`remotion/Poster.jsx`, JPEG ≤ 200 Ko) ; `POSTER_FRAME=<n>` prend plutôt une image du film.

Changer un texte : `cues.json`, puis `voice mix remotion encode poster vtt`. Changer un plan : `shots.mjs`, `node scripts/video/probe.mjs <dir> dusk shots <plan>`
pour le cadrer, puis `node scripts/video/capture.mjs <travail>/pub/frames --only <plan>`.

## Crédits (affichés à la fin de la vidéo)

- Musique : « Medieval: The Bard's Tale » — RandomMind (CC0) ; « Chillwave Nightdrive » — Bogart VGM, **CC BY 3.0** (crédit obligatoire, incrusté).
- Voix : Kokoro-82M (Apache-2.0), voix `ff_siwis` (corpus SIWIS, CC BY 4.0). Pas de Piper ici (voix CC BY-SA).
- Images : le jeu lui-même (crédits des modèles 3D dans le menu du jeu).
