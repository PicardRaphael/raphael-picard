import { SkillEntity } from '@/core/domain/entities/skills.entity';
import Image from 'next/image';

interface SkillProps {
	skill: SkillEntity;
}

const Skill = ({ skill }: SkillProps) => {
	return (
		<div className="flex w-16 flex-col items-center justify-center lg:w-24">
			<div className="relative h-5 w-5 lg:h-7 lg:w-7">
				<Image
					height={30}
					width={30}
					sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
					alt={skill.image.alt}
					src={skill.image.url}
				/>
			</div>
			<h3 className="mt-2 hidden truncate text-center text-xs text-gray-300 uppercase lg:block">{skill.title}</h3>
		</div>
	);
};

export default Skill;
