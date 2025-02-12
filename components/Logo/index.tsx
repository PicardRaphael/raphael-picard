import Image from 'next/image';

type LogoProps = {
	width?: number;
	height?: number;
};

const Logo = ({ width = 48, height = 48 }: LogoProps) => {
	return (
		<Image
			width={width}
			height={height}
			title="Raphaël PICARD EI, développeur web Front-End Freelance"
			alt="Logo Raphaël PICARD EI"
			src="https://cdn.sanity.io/images/awd9ns3x/production/63d9b0602eb31c85e2fd6a32c315a55538a215b5-148x164.svg"
			priority={true}
		/>
	);
};

export default Logo;
