"""Voice-over of the 30 s film: one WAV per line of cues.json (`segments[].vo[].say`), Kokoro-82M voice ff_siwis
(the Raphy·OS voice of the Nexus, see scripts/voices/README.md: Apache-2.0, SIWIS corpus CC BY 4.0).

Usage: python -I scripts/video/voice.py --models <dir with kokoro/> --out <dir>
Writes <out>/<segment>-<n>.wav and <out>/durations.json, and prints the room left before the next line.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
CUES = json.loads((ROOT / 'scripts' / 'video' / 'cues.json').read_text(encoding='utf-8'))


def lines():
	for s in CUES['segments']:
		for n, vo in enumerate(s.get('vo', [])):
			yield f"{s['id']}-{n}", vo


def main() -> None:
	ap = argparse.ArgumentParser()
	ap.add_argument('--models', type=Path, required=True)
	ap.add_argument('--out', type=Path, required=True)
	ap.add_argument('--speed', type=float, default=1.0)
	args = ap.parse_args()
	from kokoro_onnx import Kokoro

	k = Kokoro(str(args.models / 'kokoro' / 'kokoro-v1.0.onnx'), str(args.models / 'kokoro' / 'voices-v1.0.bin'))
	args.out.mkdir(parents=True, exist_ok=True)
	todo = list(lines())
	report = {}
	for i, (key, vo) in enumerate(todo):
		audio, sr = k.create(vo['say'], voice='ff_siwis', speed=vo.get('speed', args.speed), lang='fr-fr')
		audio = np.asarray(audio, dtype=np.float32)
		# trim the model's leading / trailing silence
		idx = np.where(np.abs(audio) > 0.01)[0]
		if len(idx):
			audio = audio[max(idx[0] - int(0.02 * sr), 0) : idx[-1] + int(0.08 * sr)]
		# -20 dB RMS, like the quest voices
		rms = np.sqrt(np.mean(audio**2)) + 1e-9
		audio = np.clip(audio * (10 ** (-20 / 20) / rms), -0.98, 0.98)
		sf.write(args.out / f'{key}.wav', audio, sr)
		dur = len(audio) / sr
		nxt = todo[i + 1][1]['at'] if i + 1 < len(todo) else CUES['duration'] / CUES['fps']
		room = nxt - vo['at'] - dur
		report[key] = {'at': vo['at'], 'dur': round(dur, 2)}
		print(f"{key:9s} at {vo['at']:5.2f}s  {dur:4.2f}s  room {room:+.2f}s  {'OVERLAP' if room < 0.15 else ''}")
	(args.out / 'durations.json').write_text(json.dumps(report, indent=1), encoding='utf-8')


if __name__ == '__main__':
	main()
