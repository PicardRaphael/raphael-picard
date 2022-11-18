import Image from 'next/image';

type LogoProps = {
  width?: number;
  height?: number;
};

const Logo = ({ width = 48, height = 48 }: LogoProps) => {
  return (
    <Image
      layout="fixed"
      width={width}
      height={height}
      title="Raphaël PICARD EI, développeur web Front-End Freelance"
      alt="Logo Raphaël PICARD EI"
      src="/assets/logo/logo-sombre.svg"
    />
  );
};

export default Logo;
