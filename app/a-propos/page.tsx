import Animate from '@/components/Framer/Animate';
import SeparateTextAndEmojis from '@/components/SeparateTextAndEmojis';
import { getService } from '@/core/application/factories/service.factory';
import { AboutUseCase } from '@/core/application/use-cases/about.use-case';
import { aProposMetadata } from '@/utils/metadata/a-propos-metadata';
import { PortableText } from 'next-sanity';
import Image from 'next/image';

export const dynamic = 'force-static';
export const revalidate = 7200;
const aboutUseCase = new AboutUseCase(getService('sanity'));
export const metadata = aProposMetadata;
const About = async () => {
	const about = await aboutUseCase.execute();
	return (
		<section className="section-black-500">
			<div className="section-container">
				<Animate animate={{ xInitial: -250, opacityInitial: 0 }} className="">
					<h2 className="title-h2 gradient hidden lg:inline">{about.title}</h2>
					<h5 className="title-h2 gradient mb-10 text-sm lg:hidden lg:text-4xl">
						<SeparateTextAndEmojis text={about.title} />
					</h5>
				</Animate>
				<div className="description mt-5 flex gap-10">
					<Animate animate={{ xInitial: -250, opacityInitial: 0 }}>
						<PortableText value={about.body} />
					</Animate>
					<Animate animate={{ xInitial: 250, opacityInitial: 0 }} className="relative hidden w-full overflow-hidden lg:block lg:rounded-md">
						<Image
							fill
							sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
							alt={about.image.alt}
							src={about.image.url}
							priority
							className="object-cover"
						/>
					</Animate>
				</div>
			</div>
		</section>
	);
};

export default About;
