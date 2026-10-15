import { site } from '@/lib/site';

export function Footer() {
	return (
		<footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm">
			<div className="text-dim mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<p>
					© {new Date().getFullYear()} {site.name} — {site.role} à Lyon.
				</p>
				<p className="font-mono text-xs">Next.js · React Three Fiber · shaders GLSL · modèles 3D Sketchfab (CC BY), Quaternius & KayKit (CC0) · musiques OpenGameArt · crédits complets dans le menu du jeu</p>
				<ul className="flex gap-4">
					<li>
						<a className="hover:text-ink transition-colors" href={site.social.linkedin} rel="me noopener" target="_blank">
							LinkedIn
						</a>
					</li>
					<li>
						<a className="hover:text-ink transition-colors" href={site.social.github} rel="me noopener" target="_blank">
							GitHub
						</a>
					</li>
					<li>
						<a className="hover:text-ink transition-colors" href={`mailto:${site.email}`}>
							E-mail
						</a>
					</li>
				</ul>
			</div>
		</footer>
	);
}
