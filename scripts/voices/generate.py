"""Pre-generate the voice-over of the game: quest dialogs, place greetings and defeated-bug cards, in two voices.

Offline, free, open-source neural TTS running on the CPU (choice and licences: scripts/voices/README.md):
  - "f" (female): Kokoro-82M, voice ff_siwis
  - "m" (male):   Supertonic 3, voice style M1

Each line is recorded in both voices: public/audio/voice/<id>-f.mp3 and <id>-m.mp3 (mono MP3), where <id> is
  <questId>-intro / <questId>-outro   lib/quests.ts (the NPC who speaks picks the default voice, SPEAKER_VOICE)
  place-<landmarkId>                  lib/place-lines.ts (default voice: male in the val, female in the Nexus)
  bug-<index>                         lib/mobs.ts, name + verdict + first measure (default voice by zone, like places)
and lib/voice-clips.json, the manifest the app reads: a clip whose text changed since it was generated is not played.
Only clips whose spoken text, voice or settings changed are regenerated (use --force for all).

Usage (from the repo root, see scripts/voices/README.md):
  python -I -X utf8 scripts/voices/generate.py --models <dir with kokoro/ and piper/>
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
MOBS_TS = ROOT / 'lib' / 'mobs.ts'
PLACES_TS = ROOT / 'lib' / 'place-lines.ts'
WORLD_TS = ROOT / 'lib' / 'world.ts'
OUT_DIR = ROOT / 'public' / 'audio' / 'voice'
MANIFEST = ROOT / 'lib' / 'voice-clips.json'

# Default voice of each quest NPC (the giver says the intro, the turn-in NPC the outro); « Auto » in the options.
SPEAKER_VOICE = {
	'raphy': 'm',
	'forge': 'm',
	'leasys': 'm',
	'schoolmouv': 'm',
	'royal': 'm',
	'holo': 'f',
	'core': 'f',
	'beacon': 'f',
}
ZONE_VOICE = {'val': 'm', 'nexus': 'f'}

VOICES = {
	# Kokoro-82M (Apache-2.0), voice ff_siwis trained on the SIWIS French corpus (CC BY 4.0).
	'f': {'engine': 'kokoro', 'voice': 'ff_siwis', 'speed': 0.95},
	# Supertonic 3 (Supertone, model under OpenRAIL-M, code MIT), built-in voice style M1.
	'm': {'engine': 'supertonic', 'model': 'supertonic-3', 'voice': 'M1', 'steps': 10, 'speed': 1.12},
}

# Spoken form of names, acronyms and English words (regex -> replacement [, only for these engines]), checked with a French ASR
# (Whisper) on both voices: Kokoro reads « IA » or « MVP » right as they are, Supertonic needs « emvépé ».
PRONUNCIATION: list[tuple] = [
	(r'Raphy·OS', 'Raphy O S'),
	(r'\bNeoteem\b', 'Néotime'),
	(r'\bNeoChat\b', 'Néo tchatte'),
	(r'\bNeo(?=[A-Z])', 'Néo '),  # NeoSupport, NeoAgent: "néo", not "neuh-o"
	(r'\bSenior AI Engineer\b', 'Sinior A I Ingénieur'),
	(r'\bIA\b', 'i a', {'piper'}),
	(r'\bLeasys\b', 'Lizisse'),
	(r'\bSchoolmouv\b', 'Skoulmouv'),
	(r'\bNexus\b', 'Nexusse'),
	(r'\b([Pp])rompt\b', r'\1rompte'),
	(r'\bLangGraph\b', 'Lang graphe'),
	(r'\bLangfuse\b', 'Lang fiouze'),
	(r'\bDeepEval\b', 'Dip Ival'),
	(r'\bRAG\b', 'ragg'),
	(r'\bMCP\b', 'M C P'),
	(r'\bSQL\b', 'S Q L'),
	(r'\bAPI\b', 'A P I'),
	(r'\bOpenAPI\b', 'Opène A P I'),
	(r'\bHTTP\b', 'H T T P'),
	(r'\bSSE\b', 'S S E'),
	(r'\bCI\b', 'C I'),
	(r'\bPR\b', 'P R'),
	(r'\bERP\b', 'E R P'),
	(r'\bMVP\b', 'emvépé', {'supertonic'}),
	(r'\bSELECT\b', 'sélecte'),
	(r'\bPydantic\b', 'Païdantik'),
	(r'\b([Gg])olden set\b', r'\1oldène sète'),
	(r'\bLLM\b', 'L L M'),
	(r'\bToken\b', 'Tokène'),
	(r'(\d) × (\d)', r'\1 fois \2'),
	(r'\bmutation testing\b', 'mutation testingue'),
	(r'\bstreaming\b', 'strimingue'),
	(r'\bFaithfulness\b', 'Féïsse-foulnesse'),
	(r'\brelease\b', 'rilize'),
	(r'\bmulti-chatbots\b', 'multi tchatbotes'),
	(r'\bhooks\b', 'houkse'),
	(r'\bcommit\b', 'commite'),
	(r'−(\d)', r'moins \1'),
	(r'\b7[   ]000\b', 'sept mille'),
	(r'\s&\s', ' et '),
]

ENCODER = {'format': 'MP3', 'compression_level': 0.45, 'bitrate_mode': 'VARIABLE'}
TARGET_RMS_DB = -20.0
# speech needs no more: a 44.1 kHz engine is resampled so that its MP3s weigh the same as the 24 kHz ones
MAX_SR = 24000
# a bug card stays 7 s on screen: its line is cut to the first items of the measure past this many characters
BUG_SPOKEN_MAX = 100
# Dubbing script of the bug cards whose first measure does not survive the automatic cut (a list ending with its verb,
# a long sentence): name -> what is said. Reviewed by ear; check it again when the lesson changes in lib/mobs.ts.
BUG_SPOKEN = {
	'Hallucination': 'Hallucination. Bornée, pas vaincue : les chiffres viennent de vues SQL, jamais du modèle.',
	'Contexte obèse': 'Contexte obèse. Dégonflé : mise en cache du contexte, moins 33 % de coûts d’inférence.',
	'Donnée invalide': 'Donnée invalide. Arrêtée à la frontière : contrats OpenAPI et schémas validés à chaque échange.',
	'Golden set biaisé': 'Golden set biaisé. Évité : les traces de production révèlent ce que le golden set ne couvre pas.',
	'Test LLM instable': 'Test LLM instable. Apprivoisé : chaque cas du golden set est rejoué 5 fois.',
	'Dérive du modèle': 'Dérive du modèle. Surveillée : chaque changement de prompt ou de modèle rejoue le golden set.',
	'Fuite de clé API': 'Fuite de clé API. Colmatée : détection de secrets en CI, et des hooks bloquent avant le commit.',
	'Token perdu': 'Token perdu. Retrouvé : prompt système, résumé de la conversation et condensés des outils.',
	'Prompt injection': 'Prompt injection. Contenue par construction : identité tirée du jeton vérifié, jeu d’outils fixe.',
}


def fnv1a(text: str) -> str:
	"""FNV-1a 32 bits over UTF-16 code units: same value as voiceHash() in lib/voice.ts."""
	h = 0x811C9DC5
	data = text.encode('utf-16-le')
	for i in range(0, len(data), 2):
		h ^= data[i] | (data[i + 1] << 8)
		h = (h * 0x01000193) & 0xFFFFFFFF
	return f'{h:08x}'


def text_hash(text: str) -> str:
	# typographic spaces (no-break, thin) do not change what is said: same normalisation as lib/voice.ts
	return fnv1a(text.replace(' ', ' ').replace(' ', ' '))


def ts_string(raw: str) -> str:
	return re.sub(r"\\(.)", r'\1', raw)


STR = r"'((?:[^'\\\n]|\\.)*)'"


def read_quests() -> list[dict]:
	"""Each quest object of QUESTS: id, giver, turnIn, intro, outro (single-quoted strings)."""
	src = QUESTS_TS.read_text(encoding='utf-8')
	body = src[src.index('export const QUESTS') :]
	quests = []
	for block in re.split(r'\n\t\{\n', body)[1:]:
		fields = dict(re.findall(r'^\t\t(id|giver|turnIn|intro|outro): ' + STR + ',', block, re.M))
		if {'id', 'giver', 'turnIn', 'intro', 'outro'} <= fields.keys():
			quests.append({k: ts_string(v) for k, v in fields.items()})
	if not quests:
		sys.exit(f'No quest found in {QUESTS_TS}')
	return quests


def read_bugs() -> list[dict]:
	"""SPECS of lib/mobs.ts in order (the bug id is the index): name, lesson, zone."""
	src = MOBS_TS.read_text(encoding='utf-8')
	body = src[src.index('const SPECS') :]
	bugs = [
		{'name': ts_string(n), 'lesson': ts_string(l), 'zone': z}
		for n, l, z in re.findall(r"\{ name: " + STR + r", lesson: " + STR + r", zone: '(\w+)'", body)
	]
	if not bugs:
		sys.exit(f'No bug found in {MOBS_TS}')
	return bugs


def read_places() -> list[dict]:
	"""PLACE_LINES of lib/place-lines.ts, with the zone of each landmark (lib/world.ts)."""
	zones = dict(re.findall(r"\{ id: '([\w-]+)', name: " + STR.replace('(', '(?:', 1) + r", hint: " + STR.replace('(', '(?:', 1) + r", zone: '(\w+)'", WORLD_TS.read_text(encoding='utf-8')))
	src = PLACES_TS.read_text(encoding='utf-8')
	places = [{'id': i, 'line': ts_string(t), 'zone': zones.get(i, 'val')} for i, t in re.findall(r"^\t'?([\w-]+)'?: " + STR + ',', src, re.M)]
	if not places:
		sys.exit(f'No place line found in {PLACES_TS}')
	return places


def lesson_gist(lesson: str) -> tuple[str, str]:
	"""Verdict and first measure: same split as lessonGist() in lib/mobs.ts."""
	first_measure = lambda t: re.split(r'[   ]; |\. ', t)[0]  # noqa: E731
	m = re.search(r'[   ]: ', lesson)
	if not m:
		return '', first_measure(lesson)
	return lesson[: m.start()], first_measure(lesson[m.start() + 3 :])


def bug_voice_text(name: str, lesson: str) -> str:
	"""Same string as bugVoiceText() in lib/mobs.ts: the text the clip is checked against."""
	head, first = lesson_gist(lesson)
	first = first[:-1] if first.endswith('.') else first
	return '. '.join(p for p in (name, head, first) if p) + '.'


def bug_spoken(name: str, lesson: str) -> str:
	"""What is said: the same line, the measure cut to its first comma-separated items when it would last over ~6 s."""
	if name in BUG_SPOKEN:
		return BUG_SPOKEN[name]
	head, first = lesson_gist(lesson)
	first = first[:-1] if first.endswith('.') else first
	lead = f'{name}. {head} : ' if head else f'{name}. '
	items = re.split(r', | — ', first)
	said = items[0]
	for item in items[1:]:
		if len(lead) + len(said) + 2 + len(item) > BUG_SPOKEN_MAX:
			break
		said += ', ' + item
	return lead + said + '.'


def spoken(text: str, engine: str) -> str:
	t = text.replace('’', "'").replace('«', '').replace('»', '').replace('…', '...').replace('Raphy·OS', 'Raphy O S').replace('·', ' ')
	t = t.replace(' ', ' ').replace(' ', ' ')
	for pattern, repl, *only in PRONUNCIATION:
		if not only or engine in only[0]:
			t = re.sub(pattern, repl, t)
	t = re.sub(r'\s+', ' ', t)
	return re.sub(r' ([.,])', r'\1', t).strip()


class Engines:
	def __init__(self, models: Path):
		self.models = models
		self._kokoro = None
		self._piper: dict[str, object] = {}
		self._supertonic: dict[str, object] = {}

	def synth(self, voice: str, text: str) -> tuple[np.ndarray, int]:
		cfg = VOICES[voice]
		engine = cfg['engine']
		if engine == 'kokoro':
			if self._kokoro is None:
				from kokoro_onnx import Kokoro

				self._kokoro = Kokoro(str(self.models / 'kokoro' / 'kokoro-v1.0.onnx'), str(self.models / 'kokoro' / 'voices-v1.0.bin'))
			audio, sr = self._kokoro.create(text, voice=cfg['voice'], speed=cfg['speed'], lang='fr-fr')
			return np.asarray(audio, dtype=np.float32), sr
		if engine == 'supertonic':
			from supertonic import TTS

			name = cfg['model']
			if name not in self._supertonic:
				self._supertonic[name] = TTS(model=name)
			tts = self._supertonic[name]
			wav, _ = tts.synthesize(text, voice_style=tts.get_voice_style(cfg['voice']), lang='fr', total_steps=cfg['steps'], speed=cfg['speed'])
			return np.asarray(wav, dtype=np.float32).reshape(-1), tts.sample_rate
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


def lines() -> list[dict]:
	"""Every line to record: id, displayed text (hashed), text to say (before the pronunciation rules), default voice."""
	out = []
	for q in read_quests():
		for kind, speaker in (('intro', q['giver']), ('outro', q['turnIn'])):
			out.append({'id': f"{q['id']}-{kind}", 'text': q[kind], 'say': q[kind], 'default': SPEAKER_VOICE.get(speaker, 'm')})
	for p in read_places():
		out.append({'id': f"place-{p['id']}", 'text': p['line'], 'say': p['line'], 'default': ZONE_VOICE[p['zone']]})
	for i, b in enumerate(read_bugs()):
		out.append({'id': f'bug-{i}', 'text': bug_voice_text(b['name'], b['lesson']), 'say': bug_spoken(b['name'], b['lesson']), 'default': ZONE_VOICE[b['zone']]})
	return out


def main():
	ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	ap.add_argument('--models', type=Path, required=True, help='folder holding kokoro/ and piper/ model files')
	ap.add_argument('--force', action='store_true', help='regenerate every clip')
	ap.add_argument('--only', help='comma-separated clip ids or prefixes (origines, place-forge, bug-)')
	ap.add_argument('--dry-run', action='store_true', help='print the spoken texts, generate nothing')
	args = ap.parse_args()
	sys.stdout.reconfigure(encoding='utf-8')

	manifest = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else {}
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	engines = Engines(args.models)
	only = args.only.split(',') if args.only else None
	clips = {}
	for line in lines():
		clip = line['id']
		if args.dry_run:
			for voice in VOICES:
				print(f"{clip:22} {voice}{'*' if voice == line['default'] else ' '} « {spoken(line['say'], VOICES[voice]['engine'])} »")
			continue
		old = manifest.get(clip) or {}
		entry = {'text': text_hash(line['text']), 'default': line['default']}
		for voice in VOICES:
			say = spoken(line['say'], VOICES[voice]['engine'])
			key = hashlib.sha1(json.dumps([say, voice, VOICES[voice], ENCODER, TARGET_RMS_DB, MAX_SR]).encode()).hexdigest()[:12]
			file = OUT_DIR / f'{clip}-{voice}.mp3'
			prev = old.get(voice)
			stale = args.force or not prev or prev.get('key') != key or not file.exists()
			wanted = any(clip == o or clip.startswith(o) for o in only) if only else stale
			if not wanted:
				if prev:
					entry[voice] = prev
				continue
			audio, sr = engines.synth(voice, say)
			if not np.isfinite(audio).all() or np.abs(audio).max() < 0.05:
				sys.exit(f'{clip}-{voice}: empty or broken audio')
			if sr > MAX_SR:
				import soxr

				audio, sr = soxr.resample(audio, sr, MAX_SR).astype(np.float32), MAX_SR
			audio = polish(audio, sr)
			sf.write(file, audio, sr, **ENCODER)
			seconds = round(len(audio) / sr, 2)
			entry[voice] = {'key': key, 'seconds': seconds, 'bytes': file.stat().st_size}
			print(f"{clip:22} {voice} {seconds:6.2f}s {file.stat().st_size / 1024:6.1f} KB  {len(say) / seconds:4.1f} chars/s  « {say} »", flush=True)
		clips[clip] = entry
	if args.dry_run:
		return

	files = {f'{c}-{v}' for c, e in clips.items() for v in VOICES if v in e}
	for stale in OUT_DIR.glob('*.mp3'):
		if stale.stem not in files:
			stale.unlink()
			print('removed', stale.name)
	MANIFEST.write_text(json.dumps(clips, ensure_ascii=False, indent='\t') + '\n', encoding='utf-8')
	takes = [e[v] for e in clips.values() for v in VOICES if v in e]
	total = sum(t['bytes'] for t in takes)
	print(f'{len(clips)} lines, {len(takes)} clips, {total / 1024 / 1024:.2f} MB, {sum(t["seconds"] for t in takes):.0f} s -> {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
	main()
