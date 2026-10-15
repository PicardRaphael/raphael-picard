import { Counter } from '@/components/ui/Counter';
import { PilotButton } from '@/components/ui/PilotButton';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { hero, stack, stats } from '@/content/profile';

export function Hero() {
	return (
		<section id="accueil" data-station="0" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center pt-24 pb-10">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="eyebrow flex items-center gap-3">
						<span className="relative flex h-2 w-2">
							<span className="bg-ok absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
							<span className="bg-ok relative inline-flex h-2 w-2 rounded-full" />
						</span>
						{hero.eyebrow}
					</p>
					<h1 id="hero-title" className="font-display mt-6 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-8xl">
						Raphaël <span className="text-gradient">Picard</span>
						<span className="text-ink/90 mt-4 block text-2xl font-semibold tracking-normal sm:text-3xl lg:text-4xl">
							<ScrambleText text={hero.headline} delay={350} />
						</span>
					</h1>
					<p className="text-mist mt-6 max-w-xl text-base leading-relaxed sm:text-lg">{hero.lead}</p>
					<div className="mt-9 flex flex-wrap items-center gap-3">
						<a
							href={hero.primaryCta.href}
							className="from-violet via-magenta to-violet rounded-full bg-gradient-to-r bg-[length:200%_auto] px-6 py-3 font-semibold text-white shadow-[0_0_40px_-8px_rgb(197_14_255_/_0.8)] transition-all duration-500 hover:bg-right"
						>
							{hero.primaryCta.label}
						</a>
						<a href={hero.secondaryCta.href} download className="glass hover:border-signal/50 rounded-full px-6 py-3 font-semibold transition-colors">
							{hero.secondaryCta.label}
						</a>
						<PilotButton />
					</div>
				</div>

				<dl className="mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
					{stats.map((s) => (
						<div key={s.label} className="glass rounded-2xl px-4 py-3">
							<dt className="text-mist order-2 text-xs leading-snug">{s.label}</dt>
							<dd className="font-display text-gradient text-3xl font-bold">
								<Counter value={s.value} suffix={s.suffix} />
							</dd>
						</div>
					))}
				</dl>
			</div>

			<div className="mt-14 overflow-hidden border-y border-white/5 bg-black/20 py-3 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
				<ul className="animate-marquee flex w-max gap-10 font-mono text-sm text-white/40" aria-label="Technologies">
					{[...stack, ...stack].map((t, i) => (
						<li key={`${t}-${i}`} aria-hidden={i >= stack.length} className="flex items-center gap-10">
							{t}
							<span className="text-magenta/60">◆</span>
						</li>
					))}
				</ul>
			</div>

			<p className="text-dim mx-auto mt-8 flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase">
				<span className="border-dim inline-block h-6 w-4 rounded-full border p-0.5">
					<span className="bg-signal block h-1.5 w-full animate-bounce rounded-full" />
				</span>
				Défilez pour décoller
			</p>
		</section>
	);
}
