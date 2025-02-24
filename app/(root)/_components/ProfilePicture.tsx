import Animate from '@/components/Framer/Animate';
import Image from 'next/image';
const ProfilePicture = ({ alt, src }: { alt: string; src: string }) => {
	return (
		<Animate animate={{ yInitial: -500, yAnimate: 0 }}>
			<div className="border-primary-default relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2">
				<Image fill sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={alt} src={src} priority className="object-cover" />
			</div>
		</Animate>
	);
};

export default ProfilePicture;
