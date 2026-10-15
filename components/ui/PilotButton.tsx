import Link from 'next/link';

/** From the classic portfolio back to the explorable 3D world. */
export function PilotButton() {
	return (
		<Link
			href="/"
			className="group border-signal/40 text-signal hover:bg-signal/10 flex items-center gap-2 rounded-full border px-5 py-3 font-mono text-sm font-medium transition-colors"
		>
			<span className="grid h-5 w-5 place-items-center rounded border border-current text-[0.6rem]" aria-hidden>
				▲
			</span>
			Explorer le monde 3D
		</Link>
	);
}
