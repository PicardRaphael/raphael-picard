import { PositionSkill } from '@/core/domain/entities/skills.entity';
import Skill from './Skill';

interface TreeSkillProps {
	skills: PositionSkill;
}

const TreeSkill = ({ skills }: TreeSkillProps) => {
	return (
		<div className="flex items-center">
			<div className="mx-auto min-h-[437px] min-w-[340px] lg:min-h-[633px] lg:min-w-[894px]">
				<div className="mx-auto mb-12 h-10">
					<div className="mx-auto flex h-[30px] w-[30px] items-center justify-center">
						<div className="btn-gradient h-[15px] w-[15px] animate-pulse rounded-full" />
					</div>
					<div className="mx-auto h-full w-[1px] border-l border-solid border-gray-600" />
				</div>

				<h2 className="pb-2 text-center text-xs font-medium tracking-tighter text-white lg:text-lg">{skills.top[0].type}</h2>
				<div className="mb-2 flex w-full items-center justify-center">
					{skills.top.map((skill) => (
						<Skill key={skill.id} skill={skill} />
					))}
				</div>
				<div className="mx-auto mb-3 h-10">
					<div className="mx-auto h-full w-[1px] border-l border-solid border-gray-600" />
				</div>
				<hr className="mx-auto w-7/12 border-t border-solid border-gray-600" />

				<div className="flex justify-center">
					{skills.left && (
						<div className="w-5/12">
							<div className="mx-auto mb-12 h-10">
								<div className="bg-black-500 mx-auto -mt-4 flex h-[30px] w-[30px] items-center justify-center">
									<div className="btn-gradient h-[15px] w-[15px] animate-pulse rounded-full" />
								</div>
								<div className="mx-auto h-full w-[1px] border-l border-solid border-gray-600" />
							</div>
							<h2 className="pb-2 text-center text-xs font-medium tracking-tighter text-white lg:text-lg">{skills.left[0].type}</h2>
							<div className="mb-2 flex w-full flex-wrap items-center justify-center gap-y-2">
								{skills.left.map((skill) => (
									<Skill key={skill.id} skill={skill} />
								))}
							</div>
						</div>
					)}
					{skills.middle && (
						<div className="-mt-4 w-2/12">
							<div className="mx-auto mb-12 h-[90%]">
								<div className="bg-black-500 mx-auto flex h-[30px] w-[30px] items-center justify-center">
									<div className="btn-gradient h-[15px] w-[15px] animate-pulse rounded-full" />
								</div>
								<div className="mx-auto h-full w-[1px] border-l border-solid border-gray-600" />
							</div>
						</div>
					)}
					{skills.right && (
						<div className="w-5/12">
							<div className="mx-auto mb-12 h-10">
								<div className="bg-black-500 mx-auto -mt-4 flex h-[30px] w-[30px] items-center justify-center">
									<div className="btn-gradient h-[15px] w-[15px] animate-pulse rounded-full" />
								</div>
								<div className="mx-auto h-full w-[1px] border-l border-solid border-gray-600" />
							</div>
							<h2 className="pb-2 text-center text-xs font-medium tracking-tighter text-white lg:text-lg">{skills.right[0].type}</h2>
							<div className="mb-2 flex w-full flex-wrap items-center justify-center gap-y-2">
								{skills.right.map((skill) => (
									<Skill key={skill.id} skill={skill} />
								))}
							</div>
						</div>
					)}
				</div>
				{skills.middle && (
					<div className="mt-3">
						<h2 className="pb-2 text-center text-xs font-medium tracking-tighter text-white lg:text-lg">{skills.middle[0].type}</h2>
						<div className="mb-2 flex w-full items-center justify-center">
							{skills.middle.map((skill) => (
								<Skill key={skill.id} skill={skill} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default TreeSkill;
