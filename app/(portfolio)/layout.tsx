import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { SceneLoader } from '@/components/three/SceneLoader';
import { Experience } from '@/components/ui/Experience';
import { Hud } from '@/components/ui/Hud';
import { MotionProvider } from '@/components/ui/MotionProvider';

/** The classic, readable portfolio: scroll journey over a 3D backdrop. */
export default function PortfolioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<a
				href="#contenu"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black"
			>
				Aller au contenu
			</a>
			<div className="atmosphere" aria-hidden />
			<SceneLoader />
			<Experience />
			<Header />
			<Hud />
			<main id="contenu">
				<MotionProvider>{children}</MotionProvider>
			</main>
			<Footer />
		</>
	);
}
