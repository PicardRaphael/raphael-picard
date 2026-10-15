import Link from 'next/link';

import { Logo } from '@/components/ui/Logo';
import { STATIONS } from '@/lib/stations';

const links = STATIONS.filter((s) => !['accueil', 'contact', 'architecture'].includes(s.id));

export function Header() {
	return (
		<header className="fixed inset-x-0 top-0 z-40">
			<nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
				<Link href="/portfolio#accueil" className="group flex items-center gap-3" aria-label="Raphaël Picard — accueil">
					<Logo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
					<span className="font-display text-sm font-semibold tracking-wide">
						Raphaël Picard
						<span className="text-mist hidden font-mono text-[0.68rem] font-normal tracking-[0.18em] uppercase sm:block">Ingénieur IA</span>
					</span>
				</Link>
				<ul className="glass hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex">
					{links.map((s) => (
						<li key={s.id}>
							<a href={`#${s.id}`} className="text-mist hover:text-ink rounded-full px-3.5 py-1.5 text-sm transition-colors hover:bg-white/5">
								{s.nav}
							</a>
						</li>
					))}
				</ul>
				<a
					href="#contact"
					className="from-violet to-magenta rounded-full bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgb(197_14_255_/_0.7)] transition-transform hover:scale-[1.04]"
				>
					Contact
				</a>
			</nav>
		</header>
	);
}
