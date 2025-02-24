'use client';
import { insertValueAfterEachElement } from '@/utils/insert-value-after-each-element';
import { TypeAnimation } from 'react-type-animation';
const TypeWriter = ({ typeWriter }: { typeWriter: string[] }) => {
	const text = insertValueAfterEachElement(typeWriter, 2000);
	return (
		<>
			<h4 className="px-10 text-center text-xs font-semibold text-gray-300 italic lg:text-2xl">
				<TypeAnimation
					cursor={false}
					preRenderFirstString={true}
					sequence={text}
					speed={50}
					deletionSpeed={90}
					repeat={Infinity}
					className="custom-type-animation-cursor"
				/>
			</h4>
		</>
	);
};

export default TypeWriter;
