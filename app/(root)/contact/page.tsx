import { PageUseCases } from '@/core/application/use-cases/page';
import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import { contactMetadata } from '@/utils/metadata/contact-metadata';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import FormContact from './_contact/form';
export const dynamic = 'force-static';
export const revalidate = 7200;
export const metadata = contactMetadata;
const socialUseCase = new PageUseCases(getRepository().sanity).socialUseCase;

const Contact = async () => {
	const social = await socialUseCase.execute();
	return (
		<section className="section-black-500">
			<div className="section-container">
				<div className="flex flex-col items-center">
					<h2 className="gradient mb-5 hidden text-lg font-bold lg:block lg:text-4xl">Contacte-moi</h2>

					<h3 className="text-xl font-bold text-white">Travaillons ensemble !</h3>
					<p className="text-md py-2 text-center text-gray-300 lg:text-lg">
						Envie de me présenter un projet, avoir un conseil, ou tout simplement échanger ?
					</p>
					<div className="flex gap-3">
						{social.map((value) => (
							<a key={value.id} className="icon-animate" target="_blank" href={value.url} rel="noreferrer" title={value.title}>
								<Image
									src={value.image.url}
									width={60}
									height={60}
									sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
									alt={value.image.alt}
								/>
							</a>
						))}
					</div>
					<div className="my-5 space-y-5">
						<div className="flex items-center justify-center space-x-5">
							<PhoneIcon className="text-primary-default h-7 w-7 animate-pulse" />
							<p>
								<a href="tel:0650931573">+33650931573</a>
							</p>
						</div>
						<div className="flex items-center justify-center space-x-5">
							<EnvelopeIcon className="text-secondary-default h-7 w-7 animate-pulse" />
							<p>
								<a href="mailto:raphaelpicard@outlook.fr">raphaelpicard@outlook.fr</a>
							</p>
						</div>
						<div className="text-primary-default flex items-center justify-center space-x-5">
							<MapPinIcon className="h-7 w-7 animate-pulse" />
							<p>Marchampt, France</p>
						</div>
					</div>
					<FormContact />
				</div>
			</div>
		</section>
	);
};

export default Contact;
