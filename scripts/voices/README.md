# Voix des personnages

`generate.py` enregistre, dans **deux voix** (féminine `f` et masculine `m`), chaque réplique lue à voix haute dans le jeu :

| Clip | Source | Voix par défaut (« Auto ») |
| --- | --- | --- |
| `<quête>-intro`, `<quête>-outro` | `intro` / `outro` de `lib/quests.ts` | celle du PNJ qui parle (`SPEAKER_VOICE`) |
| `place-<lieu>` | `lib/place-lines.ts`, lue à l'ouverture du panneau d'un lieu | homme dans le val, femme dans le Nexus |
| `bug-<n>` | `lib/mobs.ts` : nom, verdict et première parade de la fiche (4 à 6,5 s) | idem, selon la zone du bug |

Sorties : `public/audio/voice/<clip>-f.mp3` et `<clip>-m.mp3` (mono, 24 kHz max, MP3 VBR, volume harmonisé, chargés à
la demande) et `lib/voice-clips.json`, le manifeste lu par `lib/voice.ts` (empreinte FNV du texte affiché, voix par
défaut, durée et poids de chaque prise). Une réplique modifiée mais pas régénérée n'est pas jouée, et
`tests/unit/voice.test.ts` échoue : il faut relancer le script. Seules les prises dont le texte prononcé, la voix ou les
réglages ont changé sont régénérées (`--force` pour tout, `--only origines,place-forge,bug-` pour quelques clips,
`--dry-run` pour lire les textes prononcés sans rien générer).

L'option « Voix des personnages » du menu (Auto / Femme / Homme, gardée dans la sauvegarde) choisit la prise jouée.

## Voix retenues

| Voix | Moteur | Modèle | Licence |
| --- | --- | --- | --- |
| `f` (féminine) | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) | `ff_siwis`, vitesse 0,95 | Apache-2.0, corpus SIWIS CC BY 4.0 |
| `m` (masculine) | [Supertonic 3](https://huggingface.co/Supertone/supertonic-3) (paquet `supertonic`) | style `M1`, 10 étapes, vitesse 1,12 | modèle OpenRAIL-M (usage commercial permis, restrictions d'usage : notamment signaler que le contenu est généré par IA, ce que font les crédits), code MIT |

La prononciation des noms et sigles (Raphy·OS, Neoteem, SQL, golden set, Langfuse…) est réglée dans `PRONUNCIATION`, le
texte dit pour les fiches de bug trop longues dans `BUG_SPOKEN` (doublage relu, à revoir si la leçon change).

## Comment le choix a été fait (octobre 2026)

Le même extrait (une réplique de quête de 19 s, une fiche de bug, une phrase technique avec sigles et nombres) a été
généré avec chaque candidat, puis mesuré : naturel prédit par **NISQA-TTS** (modèle entraîné sur des notes humaines de
naturel de TTS, 1 à 5), intelligibilité par **taux d'erreur de caractères** d'une transcription Whisper large-v3-turbo,
**variation de la mélodie** (écart-type de F0 en demi-tons : une voix plate sonne « robot »), débit en syllabes/s, part de
pauses, sauts de hauteur parasites, et DNSMOS (propreté du signal). Extraits : moyenne des trois textes.

| Candidat | Licence | NISQA | Erreurs | F0 σ (dt) | Verdict |
| --- | --- | --- | --- | --- | --- |
| Piper `upmc` pierre (ancienne voix homme) | outil GPL-3.0, voix CC BY-SA 4.0 | 3,07 | 6,0 % | 4,5 | la plus « robot » du lot |
| Piper `upmc` jessica | idem | 3,23 | 3,7 % | 4,8 | timbre métallique |
| Piper `siwis` | CC BY 4.0 | 4,09 | 3,1 % | 3,0 | correcte, moins naturelle que Kokoro |
| Piper `tom` | jeu de données **AGPL-3.0** | 3,87 | 1,6 % | 1,8 | écartée (licence, voix plate) |
| Piper `gilles` (low) | CC0 | 4,47 | 7,0 % | 3,5 | 16 kHz, voyelles nasales cassées (phonème manquant) |
| Piper `mls` (125 locuteurs balayés, meilleurs 005, 004) | CC BY 4.0 | ≤ 4,28 | ≥ 15 % | ≈ 2,2 | mal articulée |
| **Kokoro `ff_siwis`** | Apache-2.0 | **4,54** | **1,7 %** | 2,7 | **retenue (femme)** |
| Supertonic 2 F5 / F2 | OpenRAIL-M | 4,69 / 4,51 | 2,4 / 3,8 % | 2,6 / 4,2 | à égalité dans le bruit de mesure, licence moins libre que Kokoro |
| **Supertonic 3 M1** (vitesse 1,12) | OpenRAIL-M | **4,39** | **1,7 %** | **4,2** | **retenue (homme)** : naturel et mélodie vivante |
| Supertonic 3 M2 / Supertonic 2 M1 | OpenRAIL-M | 4,34 / 4,35 | 2,2 / 3,8 % | 2,4 / 4,1 | M2 plus plate, M1 v2 plus d'erreurs |
| Pocket TTS français 24 couches (Kyutai), voix george / daan / estelle | CC BY 4.0 | 4,30 / 4,43 / 4,05 | 2,5 / 6,2 / 4,7 % | 2,4 / 3,6 / 1,8 | george : meilleure alternative libre mais plus plate ; clonage de voix réservé à un compte Hugging Face, donc exclu |
| Chatterbox multilingue (Resemble AI), voix de référence CC0 de Kyutai | MIT (filigrane Perth inaudible) | 3,56 à 4,41 | 3,4 à 24 % | 2,4 à 4,7 | expressive mais tronque les textes longs, 5 à 10 fois plus lente que le temps réel sur CPU |

Écartés sans essai pour leur licence : **XTTS-v2** (Coqui Public Model License, usage non commercial), **F5-TTS**
(poids CC BY-NC 4.0), **OuteTTS 1B** et **Fish Speech / OpenAudio** (CC BY-NC-SA), voix Kyutai **EARS / Expresso**
(CC BY-NC). Hors sujet : **StyleTTS 2** (pas de modèle français), **Orpheus français** (accès sur demande avec compte,
3 milliards de paramètres), **Parler-TTS multilingue** (Apache-2.0, non essayé : voix décrite par un texte, pas de voix fixe à rappeler
d’une réplique à l’autre), **Kyutai TTS 1.6B** (CC BY 4.0, trop lourd sur CPU).

## Régénérer

Python 3.12 (ici via `uv`), rien d'autre (l'encodage MP3 passe par libsndfile, pas besoin de ffmpeg) :

```sh
uv venv ../tts-venv --python 3.12
uv pip install --python ../tts-venv kokoro-onnx==0.6.1 supertonic==1.3.1 piper-tts==1.8.0 soundfile==0.14.0 soxr numpy

mkdir -p ../voice-models/kokoro   # hors du dépôt
curl -L -o ../voice-models/kokoro/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o ../voice-models/kokoro/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

# -X utf8 : sous Windows, certains paquets lisent leurs fichiers de configuration sans préciser l'encodage
../tts-venv/Scripts/python -I -X utf8 scripts/voices/generate.py --models ../voice-models   # ../tts-venv/bin/python hors Windows
```

Supertonic télécharge seul son modèle (~385 Mo, sans compte) depuis Hugging Face au premier lancement, dans
`~/.cache/supertonic3` (variable `SUPERTONIC_CACHE_DIR` pour le déplacer). Piper n'est plus utilisé par les voix retenues mais reste pris en charge (`'engine': 'piper'`,
modèles dans `../voice-models/piper`).

SHA-256 des modèles Kokoro :

```
7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5  kokoro/kokoro-v1.0.onnx
bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d  kokoro/voices-v1.0.bin
```

Les modèles restent hors du dépôt.
