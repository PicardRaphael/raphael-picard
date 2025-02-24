'use client';

import CardPortfolio from '@/components/Card/CardPortfolio';
import Slider from '@/components/Slider';
import { ProjectEntity } from '@/core/domain/entities/project.entity';

interface ProjetsSliderProps {
	portfolios: ProjectEntity[];
}

const ProjetsSlider = ({ portfolios }: ProjetsSliderProps) => {
	return <Slider items={portfolios} renderItem={(portfolio, slide) => <CardPortfolio portfolio={portfolio} slide={slide} />} />;
};

export default ProjetsSlider;
