'use client';
import { BlockContent } from '@/sanity.types';
import { PortableText } from 'next-sanity';
import SeparateTextAndEmojis from '../SeparateTextAndEmojis';

const TextTitle = ({ title, text }: { title: string; text: BlockContent }) => {
	return (
		<div className="pt-2 lg:pt-10">
			<h5 className="title-h2 gradient mb-10 text-sm lg:text-4xl">
				<SeparateTextAndEmojis text={title} />
			</h5>

			<div className="description mt-1 lg:mt-5">
				<PortableText value={text} />
			</div>
		</div>
	);
};

export default TextTitle;
