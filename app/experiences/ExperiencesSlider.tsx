'use client';

import CardExperience from '@/components/Card/CardExperience';
import Slider from '@/components/Slider';
import { ExperienceEntity } from '@/core/domain/entities/experiences.entity';

interface ExperiencesSliderProps {
	experiences: ExperienceEntity[];
}

const ExperiencesSlider = ({ experiences }: ExperiencesSliderProps) => {
	return <Slider items={experiences} renderItem={(experience, slide) => <CardExperience experience={experience} slide={slide} />} />;
};

export default ExperiencesSlider;
