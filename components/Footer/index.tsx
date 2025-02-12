import { urlFor } from '@/sanity/lib/image';
import { getSocial } from '@/sanity/lib/query/getSocial';
import { BeakerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const Footer = async () => {
	const social = await getSocial();
	return (
		<footer className="bg-black-700 w-full border-t border-gray-600 py-2 text-center text-sm text-gray-300 lg:py-3">
			<div className="mx-auto max-w-6xl px-4 lg:px-6">
				<div className="flex items-center justify-center lg:justify-between">
					<div className="">
						<p id="copyright" className="hidden pl-[2px] text-xs text-gray-300 lg:block">
							© {new Date().getFullYear()} developed with{' '}
							<span role="img" aria-label="Love" className="text-red-500">
								♥
							</span>{' '}
							by Raphaël PICARD
						</p>
					</div>

					<div className="hidden lg:flex">
						<p id="stack" className="flex items-center text-xs text-gray-400 lg:flex">
							<BeakerIcon className="mr-1 h-3" />
							Stack utilisé : Next.js 15 . React.js 19 . Tailwind V4
						</p>
					</div>
					<div className="flex gap-3">
						{social.map((value) => (
							<a key={value.title} className="icon-animate" target="_blank" href={value.url} rel="noreferrer" title="Linkedin">
								<Image
									src={urlFor(value.socialImage.asset!).url()}
									width={30}
									height={30}
									sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
									alt={value.socialImage.alt}
								/>
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
