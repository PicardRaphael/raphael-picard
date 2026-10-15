import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';

/** One long journey: each section is a station the ship flies to. Order = route order (see lib/stations.ts). */
export default function Home() {
	return (
		<>
			<Hero />
			<About />
			<Journey />
			<Portal />
			<Expertise />
			<Architecture />
			<Projects />
			<Contact />
		</>
	);
}
