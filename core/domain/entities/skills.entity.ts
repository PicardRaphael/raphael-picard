export type SkillPosition = 'top' | 'middle' | 'right' | 'left';
export type SkillSpeciality = 'Front end' | 'Back end' | 'Global';

export interface SkillEntity {
	id: string;
	title: string;
	image: {
		url: string;
		alt: string;
	};
	link: string;
	speciality: SkillSpeciality;
	type: string;
	position: SkillPosition;
}

export interface PositionSkill {
	top: SkillEntity[];
	middle: SkillEntity[];
	left: SkillEntity[];
	right: SkillEntity[];
}

export interface CategorizedSkills {
	front: PositionSkill;
	back: PositionSkill;
	global: PositionSkill;
}
