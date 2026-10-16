# Vidéos de présentation

Deux montages du jeu filmé image par image, sur la musique du Nexus :

- `public/video/resume-30s.*` : « Raphaël Picard en 30 secondes », 16:9, 30 s pile, voix off et sous-titres `.fr.vtt` (une version verticale `resume-30s-vertical.mp4` en bonus) ;
- `public/video/viral-vertical.*` : le montage viral 1080×1920 (~19 s), uniquement des images du jeu, sous-titres incrustés.

| Fichier                                  | Rôle                                                                                                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cues.json` / `viral.json`               | **sources uniques** des deux montages : découpage (30 i/s, un temps = 18 images à 100 BPM), textes, sons, voix, sous-titres                                                                                                                |
| `shots.mjs`                              | les mouvements de caméra des plans « cinéma » (positions en mètres du monde, `lib/world.ts`)                                                                                                                                               |
| `lib.mjs` / `capture.mjs`                | Playwright + GPU (ANGLE) : horloge et minuteries virtuelles, caméra imposée, seul le canvas WebGL est capturé                                                                                                                              |
| `viral.mjs`                              | les prises jouées (le chevalier traverse le portail, le Runner abat « Prompt injection », la trace du Noyau) filmées en captures d'écran : l'interface du jeu (fiche du bug, viseur, panneau) est dans l'image, le reste du HUD est masqué |
| `probe.mjs` / `sheet.mjs` / `stills.mjs` | repérages, planches contact, images de contrôle du montage                                                                                                                                                                                 |
| `sfx.mjs`                                | whoosh et impact du portail, tirs, impacts, carillon « bug corrigé », synthétisés (aucun échantillon)                                                                                                                                      |
| `voice.py`                               | voix off Kokoro `ff_siwis` (la voix de Raphy·OS, voir `scripts/voices/README.md`)                                                                                                                                                          |
| `mix.mjs`                                | mixage d'une feuille de montage : musique, effets, voix, ducking sous la voix, −15 LUFS                                                                                                                                                    |
| `remotion/`                              | les montages (Remotion, React) : `Resume.jsx`, `Viral.jsx`, `Poster.jsx`                                                                                                                                                                   |
| `vtt.mjs`                                | sous-titres WebVTT du film 16:9 (le film garde son texte hors du quart bas de l'image, où le lecteur les affiche)                                                                                                                          |
| `render.mjs`                             | enchaîne tout                                                                                                                                                                                                                              |

## Régénérer

Prérequis : `npm run dev` lancé (les crochets de test `window.__game`, `__player`, `__camera` n'existent qu'en dev), un GPU,
un ffmpeg avec les filtres audio (variable `FFMPEG`), Python + `kokoro-onnx` pour la voix (voir `scripts/voices/README.md`).
Remotion et son ffmpeg (libx264) s'installent tout seuls dans `<travail>/remotion`, **jamais** dans le `package.json` du dépôt.

```sh
# dossier de travail hors du dépôt (~2 Go d'images et les masters ProRes)
export FFMPEG=/c/Program\ Files/XSplit/Broadcaster/ffmpeg.exe
export REMOTION_BROWSER=~/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe
export TTS_PYTHON=../tts-venv/Scripts/python TTS_MODELS=../voice-models
node scripts/video/render.mjs ../video-work                 # tout (~15 min)
node scripts/video/render.mjs ../video-work remotion encode  # seulement remonter et réencoder
```

Étapes : `capture`, `capture-portrait`, `capture-viral`, `sfx`, `voice`, `mix`, `remotion`, `encode`, `poster`, `vtt`.
Réglages : `KBPS` (débit vidéo du film en deux passes, 1900), `VP9_KBPS` (1400), `KBPS_V` (film vertical), `KBPS_VIRAL` (2600), `CONCURRENCY` (6).
L'affiche du film est une composition à part (`remotion/Poster.jsx`, JPEG ≤ 200 Ko) ; celle du viral est son image 40 (`VIRAL_POSTER_FRAME`).

Changer un texte : `cues.json` ou `viral.json`, puis `voice mix remotion encode poster vtt`. Aucun point-virgule dans les textes (`vtt.mjs` refuse).
Changer un plan : `shots.mjs`, `node scripts/video/probe.mjs <dir> dusk shots <plan>` pour le cadrer, puis `node scripts/video/capture.mjs <travail>/pub/frames --only <plan>`.

## Crédits (incrustés à la fin des vidéos)

- Musique : « Medieval: The Bard's Tale », RandomMind (CC0) et « Chillwave Nightdrive », Bogart VGM, **CC BY 3.0** (crédit obligatoire, incrusté).
- Voix : Kokoro-82M (Apache-2.0), voix `ff_siwis` (corpus SIWIS, CC BY 4.0), y compris la fiche du bug lue par le jeu (`public/audio/voice/bug-11-f.mp3`). Pas de Piper ici (voix CC BY-SA).
- Images : le jeu lui-même (crédits des modèles 3D dans le menu du jeu).
