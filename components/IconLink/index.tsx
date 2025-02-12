import { SkillEntity } from '@/core/domain/entities/skills.entity';
import Image from 'next/image';
type IconLinkProps = SkillEntity & {
	activeText?: boolean;
	size?: string;
};

const IconLink = ({ title, link, image, activeText = true, size = 'h-7 w-7 lg:h-10 lg:w-10' }: IconLinkProps) => {
	return (
		<a href={link} target="_blank" rel="noreferrer" className="icon-animate">
			<div className="flex flex-col items-center text-gray-300 hover:text-white">
				<div className={`relative ${size}`}>
					<Image fill sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={image.alt} src={image.url} />
				</div>
				{activeText && <span className="mt-2 block text-xs uppercase lg:text-base">{title}</span>}
			</div>
		</a>
	);
};

export default IconLink;
