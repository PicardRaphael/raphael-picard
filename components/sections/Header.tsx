import Link from 'next/link';

import { Logo } from '@/components/ui/Logo';
import { STATIONS } from '@/lib/stations';

const links = STATIONS.filter((s) => !['accueil', 'contact', 'architecture'].includes(s.id));

export function Header() {
	return (
		<header className="fixed inset-x-0 top-0 z-40 transform-gpu border-b border-white/10 bg-[#05040c]/85 backdrop-blur-xl">
			<nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
				<Link href="/portfolio#accueil" className="group flex min-w-0 items-center gap-2 sm:gap-3">
					<Logo className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]" />
					<span className="font-display text-sm font-semibold tracking-wide">
						Raphaël Picard
						<span className="text-mist hidden font-mono text-[0.68rem] font-normal tracking-[0.18em] whitespace-nowrap uppercase sm:block">
							Ingénieur IA
						</span>
					</span>
				</Link>
				<ul className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 lg:flex">
					{links.map((s) => (
						<li key={s.id}>
							<a
								href={`#${s.id}`}
								className="text-mist hover:text-ink rounded-full px-3.5 py-1.5 text-sm transition-colors hover:bg-white/5"
							>
								{s.nav}
							</a>
						</li>
					))}
				</ul>
				<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
					<Link
						href="/"
						className="border-signal/50 text-signal hover:bg-signal/10 rounded-full border px-3 py-2 font-mono text-xs whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
					>
						▲ Monde 3D
					</Link>
					<a
						href="#contact"
						className="from-violet to-magenta rounded-full bg-gradient-to-r px-3 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-[0_0_24px_-4px_rgb(197_14_255_/_0.7)] transition-transform hover:scale-[1.04] sm:px-4 sm:text-sm"
					>
						Contact
					</a>
				</div>
			</nav>
		</header>
	);
}
