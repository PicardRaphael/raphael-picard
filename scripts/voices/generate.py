"""Pre-generate the voice-over of the quest dialogs (intro / outro of lib/quests.ts).

Offline, free, open-source neural TTS running on the CPU:
  - "nexus" voice (Raphy·OS, the core, the beacon): Kokoro-82M, voice ff_siwis (female)
  - "val" voice (Raphy, the forge, the val houses): Piper, fr_FR-upmc-medium, speaker pierre (male)

Outputs public/audio/voice/<questId>-<intro|outro>.mp3 (mono MP3) and lib/voice-clips.json,
the manifest the app reads: a clip whose text changed since it was generated is not played.
Only clips whose spoken text, voice or settings changed are regenerated (use --force for all).

Usage (from the repo root, see scripts/voices/README.md):
  python scripts/voices/generate.py --models <dir with kokoro/ and piper/>
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
QUESTS_TS = ROOT / 'lib' / 'quests.ts'
OUT_DIR = ROOT / 'public' / 'audio' / 'voice'
MANIFEST = ROOT / 'lib' / 'voice-clips.json'

# Who speaks: the NPC giving the quest says the intro, the turn-in NPC says the outro.
SPEAKER_VOICE = {
	'raphy': 'val',
	'forge': 'val',
	'leasys': 'val',
	'schoolmouv': 'val',
	'royal': 'val',
	'holo': 'nexus',
	'core': 'nexus',
	'beacon': 'nexus',
}

VOICES = {
	# Kokoro-82M (Apache-2.0), voice ff_siwis trained on the SIWIS French corpus (CC BY 4.0).
	'nexus': {'engine': 'kokoro', 'voice': 'ff_siwis', 'speed': 0.92},
	# Piper (GPL-3.0 tool), voice fr_FR-upmc-medium (CC BY-SA 4.0), speaker "pierre".
	'val': {'engine': 'piper', 'model': 'fr_FR-upmc-medium', 'speaker': 'pierre', 'length_scale': 1.0},
}

# Spoken form of names and acronyms (regex -> replacement), checked against espeak-ng phonemes.
PRONUNCIATION: list[tuple[str, str]] = [
	(r'Raphy·OS', 'Raphy O S'),
	(r'\bNeoteem\b', 'Néotime'),
	(r'\bNeoChat\b', 'Néo tchatte'),
	(r'\bNeo(?=[A-Z])', 'Néo '),  # NeoSupport, NeoAgent: "néo", not "neuh-o"
	(r'\bIA\b', 'i a'),
	(r'\bLeasys\b', 'Lizisse'),
	(r'\bSchoolmouv\b', 'Skoulmouv'),
	(r'\bNexus\b', 'Nexusse'),
	(r'\b([Pp])rompt\b', r'\1rompte'),
	(r'\bLangGraph\b', 'Lang graphe'),
	(r'\bLangfuse\b', 'Lang fiouze'),
	(r'\bDeepEval\b', 'Dip Ival'),
	(r'\bRAG\b', 'ragg'),
	(r'\bMCP\b', 'M C P'),
	(r'\b7[   ]000\b', 'sept mille'),
]

ENCODER = {'format': 'MP3', 'compression_level': 0.45, 'bitrate_mode': 'VARIABLE'}
TARGET_RMS_DB = -20.0


def fnv1a(text: str) -> str:
	"""FNV-1a 32 bits over UTF-16 code units: same value as voiceHash() in lib/voice.ts."""
	h = 0x811C9DC5
	data = text.encode('utf-16-le')
	for i in range(0, len(data), 2):
		h ^= data[i] | (data[i + 1] << 8)
		h = (h * 0x01000193) & 0xFFFFFFFF
	return f'{h:08x}'


def ts_string(raw: str) -> str:
	return re.sub(r"\\(.)", r'\1', raw)


def read_quests() -> list[dict]:
	"""Each quest object of QUESTS: id, giver, turnIn, intro, outro (single-quoted strings)."""
	src = QUESTS_TS.read_text(encoding='utf-8')
	body = src[src.index('export const QUESTS'):]
	quests = []
	for block in re.split(r'\n\t\{\n', body)[1:]:
		fields = dict(re.findall(r"^\t\t(id|giver|turnIn|intro|outro): '((?:[^'\\\n]|\\.)*)',", block, re.M))
		if {'id', 'giver', 'turnIn', 'intro', 'outro'} <= fields.keys():
			quests.append({k: ts_string(v) for k, v in fields.items()})
	if not quests:
		sys.exit(f'No quest found in {QUESTS_TS}')
	return quests


def spoken(text: str) -> str:
	t = text.replace('’', "'").replace('«', '').replace('»', '').replace('…', '...')
	for pattern, repl in PRONUNCIATION:
		t = re.sub(pattern, repl, t)
	return re.sub(r'\s+', ' ', t).strip()


class Engines:
	def __init__(self, models: Path):
		self.models = models
		self._kokoro = None
		self._piper: dict[str, object] = {}

	def synth(self, voice: str, text: str) -> tuple[np.ndarray, int]:
		cfg = VOICES[voice]
		if cfg['engine'] == 'kokoro':
			if self._kokoro is None:
				from kokoro_onnx import Kokoro

				self._kokoro = Kokoro(str(self.models / 'kokoro' / 'kokoro-v1.0.onnx'), str(self.models / 'kokoro' / 'voices-v1.0.bin'))
			audio, sr = self._kokoro.create(text, voice=cfg['voice'], speed=cfg['speed'], lang='fr-fr')
			return np.asarray(audio, dtype=np.float32), sr
		from piper import PiperVoice, SynthesisConfig

		name = cfg['model']
		if name not in self._piper:
			self._piper[name] = PiperVoice.load(str(self.models / 'piper' / f'{name}.onnx'))
		pv = self._piper[name]
		speaker = pv.config.speaker_id_map[cfg['speaker']] if cfg.get('speaker') else None
		chunks = list(pv.synthesize(text, syn_config=SynthesisConfig(speaker_id=speaker, length_scale=cfg.get('length_scale'))))
		pause = np.zeros(int(chunks[0].sample_rate * 0.25), dtype=np.float32)  # breath between sentences
		parts = [p for c in chunks for p in (c.audio_float_array.astype(np.float32), pause)][:-1]
		return np.concatenate(parts), chunks[0].sample_rate


def polish(audio: np.ndarray, sr: int) -> np.ndarray:
	"""Trim the silence around the speech, same loudness for both voices, soft edges."""
	env = np.abs(audio)
	loud = np.flatnonzero(env > 0.02 * env.max())
	audio = audio[max(loud[0] - int(0.05 * sr), 0) : loud[-1] + int(0.15 * sr)]
	rms = np.sqrt(np.mean(audio**2))
	audio = audio * (10 ** (TARGET_RMS_DB / 20) / max(rms, 1e-6))
	peak = np.abs(audio).max()
	if peak > 0.97:
		audio *= 0.97 / peak
	fade = int(0.01 * sr)
	audio[:fade] *= np.linspace(0, 1, fade)
	audio[-fade:] *= np.linspace(1, 0, fade)
	pad = np.zeros(int(0.12 * sr), dtype=np.float32)
	return np.concatenate([pad, audio.astype(np.float32), pad])


def main():
	ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	ap.add_argument('--models', type=Path, required=True, help='folder holding kokoro/ and piper/ model files')
	ap.add_argument('--force', action='store_true', help='regenerate every clip')
	ap.add_argument('--only', help='comma-separated quest ids')
	args = ap.parse_args()
	sys.stdout.reconfigure(encoding='utf-8')

	manifest = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else {}
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	engines = Engines(args.models)
	only = set(args.only.split(',')) if args.only else None
	clips = {}
	for q in read_quests():
		for kind, speaker in (('intro', q['giver']), ('outro', q['turnIn'])):
			clip = f"{q['id']}-{kind}"
			text = q[kind]
			voice = SPEAKER_VOICE.get(speaker, 'val')
			say = spoken(text)
			key = hashlib.sha1(json.dumps([say, voice, VOICES[voice], ENCODER, TARGET_RMS_DB]).encode()).hexdigest()[:12]
			file = OUT_DIR / f'{clip}.mp3'
			old = manifest.get(clip)
			stale = args.force or not old or old.get('key') != key or not file.exists()
			if not (q['id'] in only if only else stale):
				if old:
					clips[clip] = old
				continue
			audio, sr = engines.synth(voice, say)
			if not np.isfinite(audio).all() or np.abs(audio).max() < 0.05:
				sys.exit(f'{clip}: empty or broken audio')
			audio = polish(audio, sr)
			sf.write(file, audio, sr, **ENCODER)
			seconds = round(len(audio) / sr, 2)
			clips[clip] = {'text': fnv1a(text), 'key': key, 'voice': voice, 'seconds': seconds, 'bytes': file.stat().st_size}
			print(f'{clip:22} {voice:6} {seconds:6.2f}s {file.stat().st_size / 1024:6.1f} KB  {len(say) / seconds:4.1f} chars/s  « {say} »')

	for stale in OUT_DIR.glob('*.mp3'):
		if stale.stem not in clips:
			stale.unlink()
			print('removed', stale.name)
	MANIFEST.write_text(json.dumps(clips, ensure_ascii=False, indent='\t') + '\n', encoding='utf-8')
	total = sum(c['bytes'] for c in clips.values())
	print(f'{len(clips)} clips, {total / 1024 / 1024:.2f} MB, {sum(c["seconds"] for c in clips.values()):.0f} s -> {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
	main()
