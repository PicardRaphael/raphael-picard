# Voix des quêtes

`generate.py` lit les `intro` / `outro` de `lib/quests.ts` et produit `public/audio/voice/<quête>-<intro|outro>.mp3`
(mono, MP3 VBR ~50-60 kb/s, volume harmonisé) plus `lib/voice-clips.json`, le manifeste lu par `lib/voice.ts`.
Seules les répliques dont le texte prononcé, la voix ou les réglages ont changé sont régénérées (`--force` pour tout,
`--only origines,purge` pour quelques quêtes). Une réplique modifiée dans `quests.ts` mais pas régénérée n'est pas jouée.

| Voix | Qui | Moteur | Modèle | Licence |
| --- | --- | --- | --- | --- |
| `nexus` (féminine) | Raphy·OS, le Noyau, la Balise | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) | `ff_siwis` | Apache-2.0, corpus SIWIS CC BY 4.0 |
| `val` (masculine) | Raphy, la Forge, le garage | [Piper](https://github.com/OHF-Voice/piper1-gpl) (outil GPL-3.0) | `fr_FR-upmc-medium`, locuteur `pierre` | CC BY-SA 4.0 (les MP3 du val sont donc CC BY-SA) |

Le choix de la voix se fait par PNJ dans `SPEAKER_VOICE`, la prononciation des noms (Raphy·OS, Neoteem, NeoChat, IA…)
dans `PRONUNCIATION`.

## Régénérer

Python 3.11+ (ici via `uv`), rien d'autre (l'encodage MP3 passe par libsndfile, pas besoin de ffmpeg) :

```sh
uv venv ../tts-venv --python 3.13
uv pip install --python ../tts-venv piper-tts==1.8.0 kokoro-onnx==0.6.1 soundfile==0.14.0 numpy

mkdir -p ../voice-models/kokoro ../voice-models/piper   # hors du dépôt
curl -L -o ../voice-models/kokoro/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o ../voice-models/kokoro/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
curl -L -o ../voice-models/piper/fr_FR-upmc-medium.onnx      https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx
curl -L -o ../voice-models/piper/fr_FR-upmc-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx.json

../tts-venv/Scripts/python -I scripts/voices/generate.py --models ../voice-models   # ../tts-venv/bin/python hors Windows
```

SHA-256 des modèles utilisés :

```
7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5  kokoro/kokoro-v1.0.onnx
bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d  kokoro/voices-v1.0.bin
9abb3800c199148897a9ed64e100d224f3de83579f100044174ad19418f1786f  piper/fr_FR-upmc-medium.onnx
e8636ec15dfd5d72db37a02cb5320a20f2b8d339f2a0e4337da64c58a33a5868  piper/fr_FR-upmc-medium.onnx.json
```

Les modèles (~400 Mo) restent hors du dépôt.
