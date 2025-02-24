import Animate from '@/components/Framer/Animate';
import IconLink from '@/components/IconLink';
import SeparateTextAndEmojis from '@/components/SeparateTextAndEmojis';
import TextTitle from '@/components/TextTitle';
import { PageUseCases } from '@/core/application/use-cases/page';
import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import Image from 'next/image';
import TypeWriter from './TypeWriter';

export const dynamic = 'force-static';
export const revalidate = 7200;
const heroUseCase = new PageUseCases(getRepository().sanity).heroUseCase;
const Hero = async () => {
	const hero = await heroUseCase.execute();
	return (
		<section className="section-black-600">
			<div className="section-container">
				<Animate animate={{ yInitial: -500, opacityInitial: 0 }}>
					<div className="flex flex-wrap items-center md:flex-col">
						<div className="border-primary-default relative h-22 w-22 overflow-hidden rounded-full border-2 md:mx-auto md:h-32 md:w-32">
							<Image
								fill
								sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
								alt={hero.profilePicture.alt}
								src={hero.profilePicture.url}
								priority
								className="object-cover"
							/>
						</div>
						<div>
							<h2 className="mt-1 text-center text-lg font-semibold text-white md:mt-3 md:px-10 md:text-4xl">{hero.name}</h2>
							<h1 className="gradient mb-1 text-center text-sm font-bold uppercase md:mb-3 md:text-3xl">
								<SeparateTextAndEmojis text={hero.role} />
							</h1>
						</div>
					</div>
					<TypeWriter typeWriter={hero.typeWriter} />
					<div className="mt-2 flex flex-col border-y-2 border-gray-600/50 md:mt-5">
						<div className="flex items-center justify-around py-0.5 md:py-2">
							{hero.skills?.map((value) => <IconLink key={value.id} {...value} size="h-5 w-5 md:h-10 md:w-10" />)}
						</div>
					</div>
					<TextTitle title={hero.title} text={hero.together} />
				</Animate>
			</div>
		</section>
	);
};

export default Hero;
